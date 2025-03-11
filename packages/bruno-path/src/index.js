const path = require('path');
const os = require('os');

class BrunoPath {
  constructor() {
    this.isWindows = os.platform() === 'win32';
  }

  /**
   * Detects path type and returns appropriate path handler
   */
  getPathHandler(pathname) {
    if (this.isWindowsUNCPath(pathname)) {
      return path.win32;
    }
    if (this.isWindowsPath(pathname)) {
      return path.win32;
    }
    return path.posix;
  }

  /**
   * Checks if path is a Windows UNC path
   * Examples: \\server\share, \\wsl.localhost\Ubuntu
   */
  isWindowsUNCPath(pathname) {
    return pathname?.startsWith('\\\\') || pathname?.startsWith('//');
  }

  /**
   * Checks if path is a Windows path
   * Example: C:\Users\name
   */
  isWindowsPath(pathname) {
    return /^[a-zA-Z]:\\/.test(pathname);
  }

  /**
   * Normalize path separators to current platform
   */
  normalize(pathname) {
    if (!pathname) return pathname;
    const handler = this.getPathHandler(pathname);
    return handler.normalize(pathname);
  }

  /**
   * Join path segments using appropriate separator
   */
  join(...paths) {
    // Use the first path to determine the handler
    const handler = this.getPathHandler(paths[0]) || (this.isWindows ? path.win32 : path.posix);
    return handler.join(...paths);
  }

  /**
   * Get relative path between two paths
   */
  relative(from, to) {
    const handler = this.getPathHandler(from) || this.getPathHandler(to);
    return handler.relative(from, to);
  }

  /**
   * Get directory name from path
   */
  dirname(pathname) {
    const handler = this.getPathHandler(pathname);
    return handler.dirname(pathname);
  }

  /**
   * Get file extension
   */
  extname(pathname) {
    const handler = this.getPathHandler(pathname);
    return handler.extname(pathname);
  }

  /**
   * Resolve path to absolute
   */
  resolve(...paths) {
    const handler = this.getPathHandler(paths[0]);
    return handler.resolve(...paths);
  }

  /**
   * Get path segments
   */
  parse(pathname) {
    const handler = this.getPathHandler(pathname);
    return handler.parse(pathname);
  }

  /**
   * Convert to posix style path (forward slashes)
   */
  toPosix(pathname) {
    return pathname.replace(/\\/g, '/');
  }

  /**
   * Convert to windows style path (backslashes) 
   */
  toWin32(pathname) {
    return pathname.replace(/\//g, '\\');
  }
}

// Export singleton instance
module.exports = new BrunoPath(); 