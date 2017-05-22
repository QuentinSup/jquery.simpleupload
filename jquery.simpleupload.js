/*!
* jQuery SimpleUpload
* 1.0.2
*/
(function($) {

	var activeClass = 'simpleupload-active';
	var uploadClass = 'simpleupload-uploading';
	var dragClass = 'simpleupload-drag';
	
	// Append an input to open the discovery dialog
	var $input = $('<input type="file" id="simpleupload-inputfile" />');
	$input.css({
		'position' : 'absolute',
		'visibility' : 'hidden',
		'top' : '-999px',
		'left' : '-999px'
	});

	$input.appendTo($('body'));

	$.simpleupload = {
		default_settings : {
			autoupload : true,
			dialogAcceptFiles: "*",
			name : "simpleuploadFile",
			url : null,
			debug: false,
			sequential: true,
			dropLimit: 1,
			authorizedExtensions: "*",
			previewImage: null,
			fileMaxSize: 10 *1024*1024, // 10Mb
			initLabelPositionStyle: true,
			onServerAbort : null,
			onServerError : null,
			onServerLoad : null,
			onServerLoadStart : null,
			onUpload: null,
			onUploadProgress : null,
			onUploadComplete : null,
			onServerReadyStateChange : null,
			onAppend : null
		}
	}

	$.fn.simpleupload = function(options) {

		if (!options) {

			return $(this[0]).data('simpleupload');

		}

		return this.each(function() {
			var $this = $(this);

			var simpleUpload = $this.data('simpleupload');

			if (simpleUpload) {
				simpleUpload.updateSettings(options);
				return;
			}

			simpleUpload = new SimpleUpload(options, $this);

		});

	};

	var SimpleUpload = (function() {

		var error = function(trace) {
			if(console && console.error) console.error(trace);
		}
		
		var info = function(trace) {
			if(!this.settings.debug) return;
			if(console && console.info) console.info(trace);
		}
		
		var trace = function(trace) {
			if(!this.settings.debug) return;
			if(console && console.log) console.log(trace);
		}
		
		var upload = function(file) {
			
			console.log(file);
			
			if (typeof (this.settings.onUpload) == "function") {
				this.settings.onUpload(file);
			}
			
			this.info("Upload file '" + file.name + "'");
			
			this.processing.push(file);

			if (this.domElement) {
				this.domElement.addClass(uploadClass);
			}

			this.preview(file);
			
			var crlf = '\r\n';
			var boundary = "simpleupload-boundary-" + new Date().getTime();
			var dashes = "--";

			var that = this;

			var xmlHttpRequest = new XMLHttpRequest();
			xmlHttpRequest.upload.onabort = function(e) {
				
				that.info("Upload file '" + file.name + "' is aborted");
				
				if (typeof (that.settings.onServerAbort) == "function") {
					that.settings.onServerAbort(e, file);
				}
			};
			xmlHttpRequest.upload.onerror = function(e) {
				
				that.error("Upload file '" + file.name + "' error");
				
				if (typeof (that.settings.onServerError) == "function") {
					that.settings.onServerError(e, file);
				}
			};
			xmlHttpRequest.upload.onload = function(e) {
				if (typeof (that.settings.onServerLoad) == "function") {
					that.settings.onServerLoad(e, file);
				}
			};
			xmlHttpRequest.upload.onloadstart = function(e) {
				if (typeof (that.settings.onServerLoadStart) == "function") {
					that.settings.onServerLoadStart(e, file);
				}
			};
			xmlHttpRequest.upload.onprogress = function(e) {
				
				var percent = Math.round(e.loaded / e.total * 100 * 10) / 10; // round to 1 dec
				
				that.trace("Upload file '" + file.name + "' [" + percent + "%]");
				
				if (typeof (that.settings.onUploadProgress) == "function") {
					that.settings.onUploadProgress(file, e);
				}
			};
			xmlHttpRequest.onreadystatechange = function(e) {
				if (typeof (that.settings.onServerReadyStateChange) == "function") {
					that.settings.onServerReadyStateChange(e, file);
				}
				if (this.readyState == 4) {

					that.processing.splice(that.processing.indexOf(file), 1);

					that.done.push({
						file: file,
						result: this
					});
					
					if (that.processing.length == 0) {
						if (that.domElement) {
							that.domElement.removeClass(uploadClass);
						}
					}

					if (typeof (that.settings.onUploadComplete) == "function") {
						that.settings.onUploadComplete(file, this.status, this.responseText, this, e);
					}

					that.next();

				}
			};

			xmlHttpRequest.open('post', this.settings.url, true);

			if (file.getAsBinary) {
				var data = dashes + boundary + crlf +
					"Content-Disposition: form-data;" +
					"name=\"" + this.settings.name + "\";" +
					"filename=\"" + unescape(encodeURIComponent(file.name)) + "\"" + crlf +
					"Content-Type: application/octet-stream" + crlf + crlf +
					file.getAsBinary() + crlf +
					dashes + boundary + dashes;
				xmlHttpRequest.setRequestHeader("Content-Type", "multipart/form-data;boundary=" + boundary);
				xmlHttpRequest.sendAsBinary(data);
			} else if (window.FormData) {
				var formData = new FormData();
				formData.append(this.settings.name, file);
				xmlHttpRequest.send(formData);
			}

		};

		var isFileExtensionsAllowed = function(name) {
			var fileExtensions = this.settings.authorizedExtensions.toLowerCase().split(/[\s,]+/g);
			var ext = name.split('.').pop().toLowerCase();
			if (this.settings.authorizedExtensions != "*" && $.inArray(ext, fileExtensions) < 0) {
				return false;
			}
			return true;
		};
		
		var isFileSizeAllowed = function(size) {
			if(!this.settings.fileMaxSize || this.settings.fileMaxSize == -1) {
				return true;
			}
			if (size > this.settings.fileMaxSize) {
				return false;
			}
			return true;
		};
		
		var isFileAllowed = function(file) {
			
			if(!this.isFileExtensionsAllowed(file.name)) {
				this.error(file.name + " : File name extension is not an allowed extension (" + this.settings.authorizedExtensions + ")");
				return false;
			}
			
			if(!this.isFileSizeAllowed(file.size)) {
				this.error(file.name + " : File size exceed max file size (" + this.settings.fileMaxSize + ")");
				return false;
			}
			
			return true;
			
		};
		
		var start = function() {

			var count = 1;
			
			if(this.settings.sequential === false) {
				count = 99; // No limit 
			} else {
				count = this.settings.sequential * 1;
			}

			// Decrease count of current upload process
			count -= this.processing.length;
			
			for(var i = 0; i < count; i++) {
			
				var file = this.queue.shift();
	
				if (file) {
					this.upload(file);
				}
				
			}

		};

		var bindEvents = function() {

			var that = this;
			var $this = this.domElement;

			$this.unbind('.' + this.id);
			$(document).unbind('.' + this.id);
			$input.unbind('.' + this.id);

			$this.addClass('simpleupload-container');
			
			if ($this.is("[type=file]")) {
				$this.bind("change." + this.id, function(e) {

					that.append(this.files);
					$this.val('');

					e.preventDefault();
					e.stopImmediatePropagation();
					return false;
				});
			} else {

				var $container;
				var $label;
				
				if($this[0].nodeName == "DIV") {
					$container = $this;
				} else {
					$container = $this.parents(':first');
				}
				
				if($this[0].nodeName == "IMG") {
					if(!this.settings.dialogAcceptFiles || (this.settings.dialogAcceptFiles == "*")) {
						this.settings.dialogAcceptFiles = "image/*";
					}
					if(!this.settings.authorizedExtensions || (this.settings.authorizedExtensions == "*")) {
						this.settings.authorizedExtensions = "png,jpg,jpeg";
					}
				}
				
				if($this[0].nodeName == "LABEL") {
					$label = $this;
					$label.addClass('simpleupload-label');
					$label.attr('for', 'simpleupload-inputfile');
				}
				
				if (!$label && $container.find('.simpleupload-label').length == 0) {
					var $label = $('<label class="simpleupload-label" for="simpleupload-inputfile"></label>');
					$label.appendTo($container);
					
					if(that.settings.initLabelPositionStyle) {
						
						$container.css({
							'position': 'relative'
						});
					
						$label.css({
							'cursor': 'pointer',
							'position': 'absolute',
							'left': 0,
							'right': 0,
							'top': 0,
							'bottom': 0,
							'z-index': '9999'
						});
						
					}
					
				}
				
				$label.unbind('.' + this.id).on('click.' + this.id, function() {
					$input.attr('accept', that.settings.dialogAcceptFiles || '*').attr('multiple', that.settings.dropLimit > 1);
				});

				$input.bind('change.' + this.id, function(e) {

					that.append(this.files);
					$this.val('');

					e.preventDefault();
					e.stopImmediatePropagation();
					return false;

				});

				$container.bind("dragenter." + this.id + " dragover." + this.id, function() {

					if (!$container.hasClass(dragClass)) {
						$container.addClass(dragClass);
					}

					return false;
				}).bind("drop." + this.id + " dragleave." + this.id, function(e) {

					$container.removeClass(dragClass);

					var files = e.originalEvent.dataTransfer.files;
					
					e.preventDefault();
					e.stopImmediatePropagation();
					
					if(files.length <= that.settings.dropLimit) {
						that.append(files);
					}
					
					return false;
				});
			}

			$(document).on('dragenter.' + this.id + ' dragover.' + this.id, function(e) {

				e.preventDefault();
				e.stopImmediatePropagation();
				
				if (!$container.hasClass(activeClass)) {
					$container.addClass(activeClass);
				}

			});

			$(document).on('drop.' + this.id + ' dragleave.' + this.id, function(e) {

				e.preventDefault();
				e.stopImmediatePropagation();
				
				$container.removeClass(activeClass);

			});

		};

		var append = function(files) {

			var that = this;

			for (var i = 0; i < files.length; i++) {
				var file = files[i];
				
				if(!this.isFileAllowed(file)) {
					continue;
				}
				
				if ((function() {
						if (typeof (that.settings.onAppend) == "function") {
							if (!that.settings.onAppend(file)) {
								return false;
							}
						}
						return true;
					})()) {
					
					this.trace("Add file '" + file.name + "' to upload queue");
					
					this.queue.push(file);
				}
			}

			if (this.settings.autoupload) {
				
				this.info("Startup upload");
				
				this.start();
			}


		};
		
		var preview = function(file) {
			
			var domImagePreview;
			
			if(!this.settings.previewImage) {
				if(this.domElement[0].nodeName == "IMG") {
					domImagePreview = this.domElement;
				}
			} else {
				domImagePreview = $(this.settings.previewImage);
			}
			
			if(!domImagePreview) return;
			
			var reader = new FileReader();
			reader.onload = function(e) {
				domImagePreview.attr('src', e.target.result);
			};
			reader.readAsDataURL(file);
			
		};

		var updateSettings = function(options) {
			var settings = $.extend({}, $.simpleupload.default_settings);
			$.extend(settings, this.settings);
			if (options) {
				$.extend(settings, options);
			}
			this.settings = settings;
		};

		var constructor = function(options, domElement) {

			this.id = 'simpleupload-' + new Date().getTime();
			this.queue = [];
			this.processing = [];
			this.done = [];

			this.error = error;
			this.trace = trace;
			this.info = info;
			this.updateSettings = updateSettings;
			this.upload = upload;
			this.preview = preview;
			this.append = append;
			this.start = start;
			this.next = start; // next is a logical alias of start
			this.bindEvents = bindEvents;
			this.isFileAllowed = isFileAllowed;
			this.isFileExtensionsAllowed = isFileExtensionsAllowed;
			this.isFileSizeAllowed = isFileSizeAllowed;

			this.updateSettings(options);
	
			if (domElement) {
				this.domElement = $(domElement);
				this.domElement.data('simpleupload', this);
				this.bindEvents();
			}

		};

		return constructor;

	})();

	window.SimpleUpload = SimpleUpload;

})(jQuery);