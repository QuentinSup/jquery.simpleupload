# jquery.simpleupload
Simple upload plugin for JQuery.

* Compatible with usual dialog to select file
* Drag&Drop
* Allow preview
* Multiple options and events
* Debug trace mode

Use with jQuery selector, or throught SimpleUpload class

## Pre-requisite
Simple upload is a Jquery plugin, so simply need jQuery to work ;)

## Install

```javascript
<script src=".../jquery.simpleupload.js"></script>
```

## Usage

### Initialize with DIV

Locate a DIV into your html page

```html
<div id="simpleuploader"></div>
```

Use jQuery selector to initialize
```javascript
$('#simpleuploader').simpleupload(options);
```

### Initialize with INPUT FILE

Locate a INPUT type file into your html page

```html
<input type="file" id="simpleuploader" />
```

Use jQuery selector to initialize
```javascript
$('#simpleuploader').simpleupload(options);
```

### Initialize with IMG

Locate a IMG into your html page.
Notice that in this way, the plugin will auto set options :
* dialogAcceptFiles : if not set, will be initialized with 'image/*'
* authorizedExtensions : if no set, will be initialized with 'png,jpg,jpeg'

Plugin will also use the IMG to preview files (only if previewImage option is not set)

```html
<img id="simpleuploader" />
```

Use jQuery selector to initialize
```javascript
$('#simpleuploader').simpleupload(options);
```

### Initialize with javascript class name

Locate an HTML tag into your html page.

```html
<div id="simpleuploader"></div>
```

Create a javascript instance
```javascript
var uploader = new SimpleUpload(options, '#simpleuploader');
```

### Get SimpleUpload object (after initialization)

```javascript
var o = $('#simpleuploader').simpleupload();
```

## Options

* url
* name
* autoupload
* dialogAcceptFiles
* authorizedExtensions
* fileMaxSize
* previewImage
* dropLimit
* debug
* sequential
* initLabelPositionStyle

### url

The remote url to upload file.
The file will be uploaded by HTTP POST method.

```javascript
$('#simpleuploader').simpleupload({
  url: 'http://../upload'
});
```

### name

The remote form name of the file.
The server will identify the file by this name (different of the selected file name).

Default is 'simpleuploadFile'.

### autoupload

Files will automatically be uploaded.

Default is True.

### dropLimit

Number of files that could be dropped.

Default is 1.

### authorizedExtensions

File extensions to be authorized (white list).

Default is *.

```javascript
$('#simpleuploader').simpleupload({
  authorizedExtensions: 'png,jpg,jpeg' // Only PNG or JPEG files
});
```

### dialogAcceptFiles

The attribute to be set for the dialog search files.

Default is *.

```javascript
$('#simpleuploader').simpleupload({
  dialogAcceptFiles: 'image/*' // Only images files will appear
});
```

### fileMaxSize

The max size allowed for a file (in bytes).

Default is 10MB.

```javascript
$('#simpleuploader').simpleupload({
  fileMaxSize: 2 * 2048 // 2MB
});
```

### previewImage

The IMG element. Could be a CSS selector, or a DOM object.

No preview is set by default.

```javascript
$('#simpleuploader').simpleupload({
  previewImage: '#preview'
});
```

## Events

* onServerAbort
* onServerError
* onServerLoad
* onServerLoadStart
* onUpload
* onUploadProgress
* onUploadComplete
* onServerReadyStateChange
* onAppend
