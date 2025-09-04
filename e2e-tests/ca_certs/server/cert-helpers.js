const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

function execCommand(command, cwd = process.cwd()) {
  return execSync(command, {
    cwd,
    stdio: 'inherit',
    timeout: 30000
  });
}

function execCommandSilent(command, cwd = process.cwd()) {
  return execSync(command, {
    cwd,
    stdio: 'pipe',
    timeout: 30000
  });
}

function detectPlatform() {
  const platform = os.platform();
  switch (platform) {
    case 'darwin': return 'macos';
    case 'linux': return 'linux';
    case 'win32': return 'windows';
    default: throw new Error(`Unsupported platform: ${platform}`);
  }
}

function installOpenSSL() {
  const platform = detectPlatform();

  try {
    execCommand('openssl version');
    return;
  } catch (error) {
    console.log('openssl not found, installing...');
  }

  try {
    switch (platform) {
      case 'macos':
        execCommand('brew install openssl');
        break;
      case 'linux':
        execCommand('sudo apt-get update && sudo apt-get install -y openssl || sudo yum install -y openssl || sudo dnf install -y openssl');
        break;
      case 'windows':
        try {
          // Try chocolatey first (silent to avoid error output)
          execCommandSilent('choco install openssl -y');
        } catch (error1) {
          try {
            // Try winget as fallback
            execCommandSilent('winget install ShiningLight.OpenSSL');
          } catch (error2) {
            throw new Error('openssl installation failed: neither chocolatey nor winget found. please install openssl manually and try again.');
          }
        }
        break;
    }
  } catch (error) {
    throw new Error('failed to install openssl. please install manually and try again.');
  }
}

function createCertsDir(certsDir) {
  if (fs.existsSync(certsDir)) {
    const certFiles = ['ca-cert.pem', 'ca-key.pem', 'localhost-cert.pem', 'localhost-key.pem'];
    certFiles.forEach(file => {
      const filePath = path.join(certsDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  } else {
    fs.mkdirSync(certsDir, { recursive: true });
  }
}

function generateCertificates(certsDir) {
  const CA_SUBJECT = '/C=US/ST=Dev/L=Local/O=Local Development CA/CN=Local Dev CA';
  const SERVER_SUBJECT = '/C=US/ST=Dev/L=Local/O=Local Development/CN=localhost';

  execCommand('openssl genrsa -out ca-key.pem 4096', certsDir);
  execCommand(`openssl req -new -x509 -key ca-key.pem -out ca-cert.pem -days 3650 -subj "${CA_SUBJECT}"`, certsDir);
  execCommand('openssl genrsa -out localhost-key.pem 4096', certsDir);
  execCommand(`openssl req -new -key localhost-key.pem -out localhost.csr -subj "${SERVER_SUBJECT}"`, certsDir);

  const extensionsContent = `[v3_req]
keyUsage = critical, keyEncipherment, dataEncipherment, digitalSignature
extendedKeyUsage = serverAuth
subjectAltName = @alt_names
basicConstraints = critical, CA:FALSE
authorityKeyIdentifier = keyid,issuer:always

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
DNS.3 = localhost.localdomain
IP.1 = 127.0.0.1
IP.2 = ::1`;

  fs.writeFileSync(path.join(certsDir, 'localhost.ext'), extensionsContent);
  execCommand('openssl x509 -req -in localhost.csr -CA ca-cert.pem -CAkey ca-key.pem -CAcreateserial -out localhost-cert.pem -days 365 -extensions v3_req -extfile localhost.ext', certsDir);

  const platform = detectPlatform();
  if (platform === 'windows') {
    execCommand('openssl x509 -in ca-cert.pem -outform DER -out ca-cert.der', certsDir);
    execCommand('openssl pkcs12 -export -out localhost.p12 -inkey localhost-key.pem -in localhost-cert.pem -certfile ca-cert.pem -passout pass:testpassword', certsDir);
    execCommand('openssl x509 -in localhost-cert.pem -outform DER -out localhost-cert.der', certsDir);
  }

  if (platform !== 'windows') {
    execCommand('chmod 600 ca-key.pem localhost-key.pem', certsDir);
    execCommand('chmod 644 ca-cert.pem localhost-cert.pem', certsDir);
  }

  ['localhost.csr', 'localhost.ext', 'ca-cert.srl'].forEach(file => {
    const filePath = path.join(certsDir, file);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });
}

function addCAToTruststore(certsDir) {
  const platform = detectPlatform();

  switch (platform) {
    case 'macos': {
      const macCertPath = path.join(certsDir, 'ca-cert.pem');
      execCommand(`sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "${macCertPath}"`);
      break;
    }

    case 'linux': {
      const linuxCertPath = path.join(certsDir, 'ca-cert.pem');
      execCommand(`sudo cp "${linuxCertPath}" /usr/local/share/ca-certificates/bruno-ca.crt`);
      execCommand('sudo update-ca-certificates');
      break;
    }

    case 'windows': {
      const winCertPath = path.join(certsDir, 'ca-cert.der');

      // Escape backslashes for PowerShell
      const psPath = winCertPath.replace(/\\/g, '\\\\');

      // PowerShell .NET method (works reliably in CI)
      const psCommand = [
        `$cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2('${psPath}');`,
        `$store = New-Object System.Security.Cryptography.X509Certificates.X509Store('Root','LocalMachine');`,
        `$store.Open('ReadWrite');`,
        `$store.Add($cert);`,
        `$store.Close();`
      ].join(' ');

      try {
        execCommand(`powershell -Command "${psCommand}"`);
      } catch (error) {
        console.warn('failed to install cert to LocalMachine. trying CurrentUser...');

        const psUserStoreCommand = psCommand.replace('LocalMachine', 'CurrentUser');

        try {
          execCommand(`powershell -Command "${psUserStoreCommand}"`);
        } catch (error2) {
          console.warn('failed to install cert to CurrentUser. trying certutil fallback...');

          try {
            execCommand(`certutil -addstore -f "Root" "${winCertPath}"`);
          } catch (error3) {
            console.error('failed to install CA certificate on Windows.');
            throw error3;
          }
        }
      }

      break;
    }

    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

function verifyCertificates(certsDir) {
  const platform = detectPlatform();
  // Core PEM files required for all platforms
  const requiredFiles = ['ca-cert.pem', 'ca-key.pem', 'localhost-cert.pem', 'localhost-key.pem'];

  // Verify required PEM files exist
  for (const file of requiredFiles) {
    const filePath = path.join(certsDir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`missing certificate file: ${file}`);
    }
  }

  // Check Windows-specific files but don't require them (they're optional fallbacks)
  if (platform === 'windows') {
    const windowsFiles = ['ca-cert.der', 'localhost.p12', 'localhost-cert.der'];
    for (const file of windowsFiles) {
      const filePath = path.join(certsDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`✓ Windows certificate file available: ${file}`);
      } else {
        console.log(`⚠ Windows certificate file missing (but not required): ${file}`);
      }
    }
  }
}

function getServerCertificateOptions(certsDir) {
  return {
    key: fs.readFileSync(path.join(certsDir, 'localhost-key.pem')),
    cert: fs.readFileSync(path.join(certsDir, 'localhost-cert.pem'))
  };
}

module.exports = {
  installOpenSSL,
  createCertsDir,
  generateCertificates,
  addCAToTruststore,
  verifyCertificates,
  getServerCertificateOptions,
  detectPlatform,
  execCommand,
  execCommandSilent
};
