# Security policy

## Reporting a vulnerability

Email **[hi+security@graftful.app](mailto:hi+security@graftful.app)** with `[security]` in the
subject. Do not open a public issue for a vulnerability.

Please include:

- the Graftful version shown at the bottom of About;
- the browser and operating system;
- steps that start from an empty app or the built-in example regimen where possible;
- what an attacker could read, change or cause.

**Do not send a Graftful backup, real medicine names, doses, transplant dates, or screenshots
of a real regimen.** If an example needs data, use the built-in fictional regimen.

Graftful has one volunteer maintainer and cannot promise a commercial response time. I will
acknowledge a valid report as soon as practical, avoid publishing details while a fix is being
prepared, and credit the reporter if they want to be named.

## Scope

The current v1 is a static, local-first application. It has no account system, application
backend, or server-side copy of a regimen. Relevant reports include:

- a path that sends medication or regimen data off the device;
- another website being able to read or modify Graftful's IndexedDB data;
- import files escaping validation or corrupting unrelated local data;
- service-worker or cache behaviour that serves untrusted content;
- a dependency or build process that changes these properties.

Questions about medication, missed doses, interactions or treatment are not security reports
and cannot be answered by this project. Contact your transplant team.
