# jquery.simpleupload
Simple upload plugin for JQuery

* Compatible with usual dialog to select file
* Drag&Drop
* Allow preview
* Multiple options and events

## Pre-requisite
Simple upload is a Jquery plugin, so need jQuery to work.

## Install

```javascript
<script src=".../jquery.simpleupload.js"></script>
```

## Usage

SimpleUpload provide 

### Initialize

Locate a DIV into your html page

```html
<div id="simpleuploader"></div>
```

Use jQuery selector to initialize
```javascript
$('#simpleuploader').simpleupload();
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
  dialogAcceptFiles: 'image/*' // Only images files will appear
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
* onServerReadyStateChang
* onAppend
