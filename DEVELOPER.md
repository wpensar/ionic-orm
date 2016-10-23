# Building and Testing Ionic-ORM

## Please remember to constribute and fork [TypeORM](https://github.com/typeorm/typeorm) for any issues that are not in the WebSQL and SQLite driver; once accepted over there, Ionic-ORM will pull the changes.

The Reason why Ionic-ORM has to be seperate is because TypeORM is a module that is primary meant to be ran on a server side application and not a client; we are taking advantage of their amazing SQL builder and ORM abilities done in typescript.


This document describes how to set up your development environment and run Ionic-ORM test cases.

* [Prerequisite Software](#prerequisite-software)
* [Getting the Sources](#getting-the-sources)
* [Installing NPM Modules](#installing-npm-modules)
* [Building](#building)
* [Running Tests Locally](#running-tests-locally)

See the [contribution guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md)
if you'd like to contribute to Angular.

## Prerequisite Software

Before you can build and test TypeORM, you must install and configure the
following products on your development machine:

* [Git](http://git-scm.com) and/or the **GitHub app** (for [Mac](http://mac.github.com) or
  [Windows](http://windows.github.com)); [GitHub's Guide to Installing
  Git](https://help.github.com/articles/set-up-git) is a good source of information.

* [Node.js](http://nodejs.org), (better to install latest version) which is used to run a development web server,
  run tests, and generate distributable files.
  Depending on your system, you can install Node either from source or as a pre-packaged bundle.


## Getting the Sources

Fork and clone the repository:

1. Login to your GitHub account or create one by following the instructions given [here](https://github.com/signup/free).
2. [Fork](http://help.github.com/forking) the [main TypeORM repository](https://github.com/ionic-orm/ionic-orm).
3. Clone your fork of the TypeORM repository and define an `upstream` remote pointing back to
   the TypeORM repository that you forked in the first place.

```shell
# Clone your GitHub repository:
git clone git@github.com:<github username>/ionic-orm.git

# Go to the TypeORM directory:
cd ionic-orm

# Add the main TyepORM repository as an upstream remote to your repository:
git remote add upstream https://github.com/ionic-orm/ionic-orm.git
```
## Installing NPM Modules

Install all TypeORM dependencies by running this command:

```shell
npm install
```

During installation you may have some probelems with some dependencies.
For example to proper install oracle driver you need to follow all instructions from
 [node-oracle documentation](https://github.com/oracle/node-oracledb).

Also install typescript globally:

* `npm install -g typescript` (you might need to prefix this command with `sudo`)

## Building

To build a distribution package of Ionic-ORM run:

```shell
tsc
```

This command will generate you a distribution package in the `dist/` directory.
You can link (or simply copy/paste) this directory into your project and test TypeORM there
(but make sure to keep all node_modules required by TypeORM).



