## Shell

- For every `exec_command` call, set:
    - `shell=C:\Git\bin\bash.exe`
    - `login=false`
    - `workdir=c:\path\to\project\directory`
- Run the command directly through `bash.exe`.
- Never launch Bash through PowerShell or `cmd.exe`.
- Never use nested `bash -c` wrappers or shell quoting layers.
- Write all command text using Git Bash syntax.
- Replace C:\path\to\project\directory with the actual directory....

Don't run any unit/integration tests unless I ask... only type testing is allowed.
.env.test is for `pnpm test:integration`, which starts multiple docker instances, do not use that.

.env is for general local testing

## Prisma schemas

BSO: `prisma/schema.prisma` is truth. Keep `packages/robochimp/prisma/bso_schema.prisma` synced.

RoboChimp: `packages/robochimp/prisma/robochimp_schema.prisma` is truth. Keep `prisma/robochimp.prisma` synced.

