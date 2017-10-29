# Tech✔Check  

TechCheck is an open-source inventory checkout and reservation web app. Get started with a self hosted version, or try the live demo. 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

[NodeJS](https://nodejs.org/en/download/)

[MongoDB](https://github.com/mongodb/mongo)

### Installing

Once prerequisites have been installed:

```
git clone https://github.com/asonj/TechCheck.git
npm install
mongod
gulp watch
```



Visit *localhost:8080* to view the sit. (or localhost:8081 for live reload with [BrowserSync](https://github.com/BrowserSync/browser-sync))




## Deployment

```
gulp build
```

The */dist* directory will contain the minified production files.

Environment variables located in /.env are set to defaults and should be customized before deploying. 

To test the minified files:

```
gulp watch-production
```
## Notes

If pushing to a public source, be sure to uncomment the line for .env in the .gitignore file. 


## Built With

* [NodeJs](https://github.com/nodejs/node) - Backend
* [Express](https://github.com/expressjs/express) - Web Framework
* [MongoDb](https://github.com/mongodb/mongo) - Database
* [Bulma](https://github.com/jgthms/bulma) - CSS Framework
* [Sass](https://github.com/sass/sass) 

## Contributing

TechCheck is a work in progress and will continue to grow and evolve. I welcome any community involvement and would love to hear feedback and ideas for improvements or revisions to the site. 

Please read [CONTRIBUTING.md](https://gist.github.com/) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

TODO

## Authors

* **Alex Johnson** - [asonj](https://github.com/asonj)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the GNU Affero General Public License - see the [LICENSE.md](LICENSE.md) file for details

