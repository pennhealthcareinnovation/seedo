# Seedo - Automated GME Procedure Logging

Automated GME (Graduate Medical Education) procedure logging interface between Epic Clarity and [Medhub API](https://api-docs.medhub.com/).

## Observables

An observable is a data source that can be used to populate the observation database for trainees. Currently this is mainly MSSQL queries against Epic Clarity data warehouse. NOTE: Our Claritys queries are **not** part of this repo.

## Core Dependencies/Architecture

- [NestJS](https://nestjs.com/) - NodeJS architecture framework
- [Prisma](https://www.prisma.io/) - ORM for Postgres and other databases
- [AdminJS](https://adminjs.co/) - administration panel
- [MJML](https://mjml.io/) - email formatting
- [Azure Functions](https://docs.microsoft.com/en-us/azure/azure-functions/) - "serverless" cloud infrastructure used for asynchronous batch jobs
