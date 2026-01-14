export const FILE_EXTENSIONS = ['.ts', '.js', '.json', '.txt', '.md', '.html', '.css']

export const containsExt = (str: string) => FILE_EXTENSIONS.some(ext => str.endsWith(ext))
export const specialDirs = (str: string) => ['.', '..'].includes(str)

export function buildPath(path: string, output?: string, ext: string | null = 'json'): any {
  if (isPath(output)) {
    return output
  } else {
    output = ''
  }

  const normalize = (path: string) => path.replace(/(^\/+)|(\/+)(?=\.)|(\/){2,}/g, '$3')
  const parts = path.split('.', 2)

  if (parts.length > 1) {
    ext ??= parts.pop() as string
    output += `/${parts.join('.')}`
  }

  return normalize([output, 'report', ext].join('.'))
}

export function isPath(path?: any): boolean {
  const lastSegment = typeof path === 'string' && path.split('/').pop()

  return !!lastSegment && !specialDirs(lastSegment) && containsExt(lastSegment)
}
