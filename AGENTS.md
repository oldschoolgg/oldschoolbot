# Rules:

- Don't change anything under data/ it's all dynamically generated.
- Any changes to prisma.schema should be mirrored in package/robochimp's schema mirrors
- - master branch is 'osb' and bso branch is 'bso'. Use your brain or src/lib/constants BOT_TYPE to figure out which we're on.
- Don't run any tests unless asked.
- Don't try and clean anything up. Run pnpm lint once at the end which will handle the formatting.
- The only "test" you can run without asking is pnpm "test:types" and this should only be run near the end to make sure it's not broken.
- Don't use powershell, it doesn't work right. Use WSL or git bash. Don't use any .ps1 shims/scripts, pnpm.cmd works just fine.
-
