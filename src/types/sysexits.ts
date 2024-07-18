export const enum EX {
  OK = 0, // Successful termination
  ERROR = 1, // General errors
  USAGE = 64, // Command line usage error
  DATAERR = 65, // Data format error
  NOINPUT = 66, // Cannot open input
  NOUSER = 67, // Addressee unknown
  NOHOST = 68, // Host name unknown
  UNAVAILABLE = 69, // Service unavailable
  SOFTWARE = 70, // Internal software error
  OSERR = 71, // System error (e.g., can't fork)
  OSFILE = 72, // Critical OS file missing
  CANTCREAT = 73, // Can't create (user) output file
  IOERR = 74, // Input/output error
  TEMPFAIL = 75, // Temp failure; user is invited to retry
  PROTOCOL = 76, // Remote error in protocol
  NOPERM = 77, // Permission denied
  CONFIG = 78, // Configuration error
}
