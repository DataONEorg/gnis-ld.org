# gnis-ld.org

Frontend for https://gnis-ld.org

## Building

To build the source, run `gulp` from the project root.

When building a stage docker image, run

`docker build -t thomasthelen/gnis-ld:stage .`

When building a production docker image, run

`docker build -t thomasthelen/gnis-ld:latest .`

Finally, push the image to `thomasthelen/gnis-ld:<stage/latest>`

## Running

To run the website, run the following from the project root

```
npm i -g gulp
npm i
gulp
```

## Developing

The website uses a 3-column layout for the area beneath the banner. The leftmost and rightmost columns are the white gutters on the side of the page while the center column holds the content. This structure is defined in the `layout.pug` file and new pages should extend it. If a page needs to have any content in the header (for linking scripts, stylesheets, etc), `block content-header` can be defined with the requirements.

For example, to create a new page called `news`, create a new pug file as `lib/webapp/_layout/news.pug`.

news.pug
```
block content-header
  link(rel='stylesheet', type='text/css', href='/style/news.css')
  script(src='/script/news.js')

block content-block
  body
    .content-layout
      .left-col 
      .content
        .page-content
          .news-content1
          .news-content2
          .news-content3
```

One shortcoming of the template is the tricky rule that every page must have, at a minimum in their `content-block`.

```
  body
    .content-layout
      .left-col 
      .content
        .page-content
```

New page content is inserted underneath the `page-content` div.

Next, add a route in `server.js` so that connecting clients get the correct page delivered.

```
k_app.get([
	'/news',
], (d_req, d_res) => {
	d_res.type('text/html');
	d_res.render('news');
  d_res.set('Access-Control-Allow-Origin', '*');
});
```
### Debugging

There are a number of things that can go wrong .

Some potential mishaps:

  - You're modifying files in `dist/` rather than `lib/`
  - The file in `lib/` isn't copied over to `dist/` during the build
  - The route for a file/page isn't defined in `server.js`
  - The route is pointing to the wrong location
  - The gulp task isn't finding the new file

### Build System

`gulpfile.js` contains the gulp tasks for building and running the application. Each gulp task accomplishes a small part in the build process. For example, there's a task for turning the less styling sheets into css and another for compiling the pug files. There are also higher level tasks that combine these steps, for example the `default` task (which performs a build).

One potentially confusing part of the build/content serving system is that _not all files are served from dist/_. The paths to the files (css, ontology files, robots.txt, etc) are defined in `server.js`. Some of the files are being directly served from the `lib` directory.
