const brunoPath = require('./index');

describe('BrunoPath', () => {
  describe('isWindowsUNCPath', () => {
    it('should identify Windows UNC paths', () => {
      expect(brunoPath.isWindowsUNCPath('\\\\server\\share')).toBe(true);
      expect(brunoPath.isWindowsUNCPath('//server/share')).toBe(true);
      expect(brunoPath.isWindowsUNCPath('\\\\wsl.localhost\\Ubuntu')).toBe(true);
      expect(brunoPath.isWindowsUNCPath('C:\\Users\\name')).toBe(false);
      expect(brunoPath.isWindowsUNCPath('/usr/local')).toBe(false);
    });
  });

  describe('isWindowsPath', () => {
    it('should identify Windows drive paths', () => {
      expect(brunoPath.isWindowsPath('C:\\Users\\name')).toBe(true);
      expect(brunoPath.isWindowsPath('D:\\Program Files')).toBe(true);
      expect(brunoPath.isWindowsPath('\\\\server\\share')).toBe(false);
      expect(brunoPath.isWindowsPath('/usr/local')).toBe(false);
    });
  });

  describe('normalize', () => {
    it('should normalize paths based on type', () => {
      expect(brunoPath.normalize('C:\\Users\\name\\..')).toBe('C:\\Users');
      expect(brunoPath.normalize('/usr/local/..')).toBe('/usr');
      expect(brunoPath.normalize('\\\\server\\share\\..')).toBe('\\\\server');
    });

    it('should handle empty or invalid paths', () => {
      expect(brunoPath.normalize('')).toBe('');
      expect(brunoPath.normalize(null)).toBe(null);
      expect(brunoPath.normalize(undefined)).toBe(undefined);
    });
  });

  describe('join', () => {
    it('should join paths using correct separator', () => {
      expect(brunoPath.join('C:\\Users', 'name', 'docs')).toBe('C:\\Users\\name\\docs');
      expect(brunoPath.join('/usr', 'local', 'bin')).toBe('/usr/local/bin');
      expect(brunoPath.join('\\\\server', 'share', 'folder')).toBe('\\\\server\\share\\folder');
    });
  });

  describe('relative', () => {
    it('should get relative path between two paths', () => {
      expect(brunoPath.relative('C:\\Users\\name', 'C:\\Users\\name\\docs')).toBe('docs');
      expect(brunoPath.relative('/usr/local', '/usr/local/bin')).toBe('bin');
      expect(brunoPath.relative('\\\\server\\share', '\\\\server\\share\\folder')).toBe('folder');
    });
  });

  describe('dirname', () => {
    it('should get directory name from path', () => {
      expect(brunoPath.dirname('C:\\Users\\name\\file.txt')).toBe('C:\\Users\\name');
      expect(brunoPath.dirname('/usr/local/bin/app')).toBe('/usr/local/bin');
      expect(brunoPath.dirname('\\\\server\\share\\file.txt')).toBe('\\\\server\\share');
    });
  });

  describe('extname', () => {
    it('should get file extension', () => {
      expect(brunoPath.extname('C:\\Users\\name\\file.txt')).toBe('.txt');
      expect(brunoPath.extname('/usr/local/app.js')).toBe('.js');
      expect(brunoPath.extname('\\\\server\\share\\doc.pdf')).toBe('.pdf');
      expect(brunoPath.extname('file')).toBe('');
    });
  });

  describe('parse', () => {
    it('should parse path into components', () => {
      expect(brunoPath.parse('C:\\Users\\name\\file.txt')).toEqual({
        root: 'C:\\',
        dir: 'C:\\Users\\name',
        base: 'file.txt',
        ext: '.txt',
        name: 'file'
      });

      expect(brunoPath.parse('/usr/local/app.js')).toEqual({
        root: '/',
        dir: '/usr/local',
        base: 'app.js',
        ext: '.js',
        name: 'app'
      });
    });
  });

  describe('toPosix', () => {
    it('should convert to posix style path', () => {
      expect(brunoPath.toPosix('C:\\Users\\name')).toBe('C:/Users/name');
      expect(brunoPath.toPosix('\\\\server\\share')).toBe('//server/share');
      expect(brunoPath.toPosix('/usr/local')).toBe('/usr/local');
    });
  });

  describe('toWin32', () => {
    it('should convert to windows style path', () => {
      expect(brunoPath.toWin32('C:/Users/name')).toBe('C:\\Users\\name');
      expect(brunoPath.toWin32('//server/share')).toBe('\\\\server\\share');
      expect(brunoPath.toWin32('/usr/local')).toBe('\\usr\\local');
    });
  });

  describe('resolve', () => {
    it('should resolve to absolute path', () => {
      // These tests are platform-dependent, so we'll test the basic functionality
      expect(brunoPath.resolve('foo', 'bar')).toBeTruthy();
      expect(brunoPath.resolve('/foo', 'bar')).toBeTruthy();
      expect(brunoPath.resolve('C:\\foo', 'bar')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle mixed separators', () => {
      expect(brunoPath.normalize('C:\\Users/name\\docs/file.txt'))
        .toBe('C:\\Users\\name\\docs\\file.txt');
    });

    it('should handle dots in path', () => {
      expect(brunoPath.normalize('C:\\Users\\..\\name\\.\\docs'))
        .toBe('C:\\name\\docs');
    });

    it('should handle empty segments', () => {
      expect(brunoPath.join('C:\\Users', '', 'name'))
        .toBe('C:\\Users\\name');
    });
  });
}); 