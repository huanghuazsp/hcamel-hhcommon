/*
 * Copyright 2005 Joe Walker
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * The DWR object is also defined by dwr.util etc.
 */
if (typeof dwr == 'undefined') dwr = {};

(function() {
  if (!dwr.engine) dwr.engine = {};

  /**
    * Set an alternative error handler from the default alert box.
    * @param {Function} handler The function to call when an error happens
    */
  dwr.engine.setErrorHandler = function(handler) {
    dwr.engine._errorHandler = handler;
  };

  /**
    * Set an alternative warning handler from the default alert box.
    * @param {Function} handler The function to call when a warning happens
    */
  dwr.engine.setWarningHandler = function(handler) {
    dwr.engine._warningHandler = handler;
  };

  /**
    * @deprecated - In favor of the errorHandler being called with an exception name:"dwr.engine.textHtmlReply"
    * containing a responseText property if available.
    *
    * Setter for the text/html handler - what happens if a DWR request gets an HTML
    * reply rather than the expected Javascript. Often due to login timeout
    * @param {Function} handler The function to call on an unexpected text/html content type
    */
  dwr.engine.setTextHtmlHandler = function(handler) {
    dwr.engine._textHtmlHandler = handler;
  };

  dwr.engine.setPollStatusHandler = function(handler) {
    dwr.engine._pollStatusHandler = handler;
  };

  /**
   * Set a default timeout value for all calls. 0 (the default) turns timeouts off.
   * @param {Function} handler The function to call when we get bored of waiting for a call
   */
  dwr.engine.setTimeout = function(timeout) {
    dwr.engine._timeout = timeout;
  };

  /**
   * Set a timeout value for Reverse Ajax polls. 0 (the default) turns timeouts off.
   */
  dwr.engine.setPollTimeout = function(timeout) {
    dwr.engine._pollTimeout = timeout;
  };

  /**
    * The Pre-Hook is called before any DWR remoting is done.
    * @param {Function} handler The function to call before any remote calls
    */
  dwr.engine.setPreHook = function(handler) {
    dwr.engine._preHook = handler;
  };

  /**
   * The Post-Hook is called after any DWR remoting is done.
   * @param {Function} handler The function to call after any remote calls
   */
  dwr.engine.setPostHook = function(handler) {
    dwr.engine._postHook = handler;
  };

  /**
   * Set a custom path to the DWR servlet (may be a full URL for cross-domain usage)
   * @param {string} path path or URL
   */
  dwr.engine.setOverridePath = function(path) {
    dwr.engine._overridePath = path;
  };

  /**
   * Set a custom contextPath (typically used when rewriting paths through a web server)
   * @param {string} path path
   */
  dwr.engine.setOverrideContextPath = function(path) {
    dwr.engine._overrideContextPath = path;
  };

  /**
   * Extra attributes to append to the DWRSESSIONID cookie (domain, secure, etc)
   * @param {string} attributeString attribute string according to cookie syntax
   */
  dwr.engine.setCookieAttributes = function(attributeString) {
    dwr.engine._cookieAttributes = attributeString;
  };

  /**
   * Custom headers for all DWR calls
   * @param {Object} headers Object containing name/value pairs for extra headers
   */
  dwr.engine.setHeaders = function(headers) {
    dwr.engine._headers = headers;
  };

  /**
   * Custom attributes transferred to server for all DWR calls
   * @param {Object} attributes Object containing name/value pairs for attributes
   */
  dwr.engine.setAttributes = function(attributes) {
    dwr.engine._attributes = attributes;
  };

  /**
   * Ensure that remote calls happen in the order in which they were sent? (Default: false)
   * @param {boolean} ordered true to enable ordered processing
   */
  dwr.engine.setOrdered = function(ordered) {
    dwr.engine._ordered = ordered;
  };

  /**
   * Do we ask the XHR object to be asynchronous? (Default: true)
   * Warning: it is <strong>highly</strong> advised to use the default of async
   * processing, especially when dealing with Internet based requests.
   * @param {boolean} async false to enable sync processing for XHR queries
   */
  dwr.engine.setAsync = function(async) {
    dwr.engine._async = async;
  };

  /**
   * Does the client actively check the server for updates? (Default: false)
   * @param {boolean} async true to enable low latency reverse ajax
   */
  dwr.engine.setActiveReverseAjax = function(activeReverseAjax) {
    if (activeReverseAjax) {
      // Bail if we are already started
      if (dwr.engine._activeReverseAjax) return;
      // We always want a retry policy when reverse AJAX is enabled.
      if (!dwr.engine._retryIntervals || dwr.engine._retryIntervals.length === 0) { dwr.engine._retryIntervals = dwr.engine._defaultRetryIntervals; }
      dwr.engine._activeReverseAjax = true;
      if (dwr.engine._initializing) return; // We'll start after init is done
      dwr.engine._poll();
    }
    else {
      // Can we cancel an existing request?
      if (dwr.engine._activeReverseAjax && dwr.engine._pollBatch) {
        dwr.engine.transport.abort(dwr.engine._pollBatch);
      }
      dwr.engine._activeReverseAjax = false;
    }
    // TODO: in iframe mode, if we start, stop, start then the second start may
    // well kick off a second iframe while the first is still about to return
    // we should cope with this but we don't
  };

  /**
   * Turn server notification of page unload on and off
   * @param {boolean} notify true or false depending on if we want to turn unload notification on or off
   */
  dwr.engine.setNotifyServerOnPageUnload = function(notify, asyncUnload) {
    dwr.engine._asyncUnload = (asyncUnload !== undefined) ? asyncUnload : false;
    dwr.engine._isNotifyServerOnPageUnload = notify;
  };

  /**
   * Turn server notification of page load on and off
   * @param {boolean} notify true or false depending on if we want to turn load notification on or off
   */
  dwr.engine.setNotifyServerOnPageLoad = function(notify) {
    dwr.engine._isNotifyServerOnPageLoad = notify;
    if (notify && !dwr.engine._initializing && !dwr.engine._isNotifyServerOnPageLoadSent) {
      eval("dwr.engine._execute(dwr.engine._pathToDwrServlet, '__System', 'pageLoaded', [ function() { dwr.engine._ordered = false; }]);");
      dwr.engine._isNotifyServerOnPageLoadSent = true;
    }
  };

  /*
   * The maximum number of retries, when reached we will no longer attempt to check for server status.
   * @param - maxRetries
   */
  dwr.engine.setMaxRetries = function(maxRetries) {
    dwr.engine._maxRetries = maxRetries;
  };

  /*
   * The intervals between successive retries in seconds
   * @param - array of integers representing the retry interval in seconds.
   */
  dwr.engine.setRetryIntervals = function(intervalsArray) {
    dwr.engine._retryIntervals = intervalsArray;
  };

  /**
   * The default message handler.
   * @param {String} message The text of the error message
   * @param {Object} ex An error object containing at least a name and message
   */
  dwr.engine.defaultErrorHandler = function(message, ex) {
    dwr.engine._debug("Error: " + ex.name + ", " + ex.message, true);
    if (!message) message = "A server error has occurred.";
    // Ignore NS_ERROR_NOT_AVAILABLE if Mozilla is being narky
    if (message.indexOf("0x80040111") != -1) return;
    if ("true" == "true") alert(message);
  };

  /**
   * The default warning handler.
   * @param {String} message The text of the error message
   * @param {Object} ex An error object containing at least a name and message
   */
  dwr.engine.defaultWarningHandler = function(message, ex) {
    dwr.engine._debug(message);
  };

  /**
   * The default poll status handler.
   * @param {boolean} newStatus - true = online, false = offline
   * @param {object} ex - The exception if one exists (offline).
   */
  dwr.engine.defaultPollStatusHandler = function(newStatus, ex) {
    dwr.engine.util.logHandlerEx(function() {
      if (newStatus === false && dwr.engine._errorHandler) dwr.engine._errorHandler(ex.message, ex);
    });
  };

  /**
   * For reduced latency you can group several remote calls together using a batch.
   */
  dwr.engine.beginBatch = function() {
    if (dwr.engine._batch) {
      dwr.engine._handleError(null, { name:"dwr.engine.batchBegun", message:"Batch already begun" });
      return;
    }
    dwr.engine._batch = dwr.engine.batch.create();
  };

  /**
   * Finished grouping a set of remote calls together. Go and execute them all.
   * @param {Object} options A options object to customize processing
   */
  dwr.engine.endBatch = function(options) {
    var batch = dwr.engine._batch;
    if (batch == null) {
      dwr.engine._handleError(null, { name:"dwr.engine.batchNotBegun", message:"No batch in progress" });
      return;
    }
    dwr.engine._batch = null;
    if (batch.map.callCount === 0) {
      return;
    }

    // The hooks need to be merged carefully to preserve ordering
    if (options) {
      dwr.engine.batch.merge(batch, options);
    }

    // In ordered mode, we don't send unless the list of sent items is empty
    // (queuing is not possible for sync calls so let them slip through)
    if (batch.async && (dwr.engine._ordered || dwr.engine._internalOrdered) && dwr.engine._batchesLength !== 0) {
      dwr.engine._batchQueue[dwr.engine._batchQueue.length] = batch;
    }
    else {
      return dwr.engine.transport.send(batch);
    }
  };

  /**
   * For use with file downloads. When a DWR function returns a binary download
   * you can prompt the user to save it using this function
   * @param {Object} data The binary data passed from DWR
   */
  dwr.engine.openInDownload = function(data) {
    var div = document.createElement("div");
    document.body.appendChild(div);
    div.innerHTML = "<iframe width='0' height='0' scrolling='no' frameborder='0' src='" + data + "'></iframe>";
  };

  /**
   * What is the current version DWR number
   * DWR version numbers are of the form "Version 1.2.3.3128[.beta]", where:
   * 1 is the major release number. Changes in major version number indicate
   * significant enhancements in functionality
   * 2 is the minor release number. Changes in minor version number indicate
   * less significant changes in functionality
   * 3 is the revision release number. Changes here typically indicate bug
   * fixes only
   * 3128 is the build number. This number increments for each build
   * .beta is a release title that is generally only used for non production
   * releases to indicate the purpose/quality of the release
   * The label is these strings concatenated
   */
  dwr.version = {
    /**
     * Changes in major version number indicate significant enhancements
     */
    major:parseInt("3", 10),

    /**
     * Changes in minor version number indicate smaller enhancements
     */
    minor:parseInt("0", 10),

    /**
     * Changes with the revision number typically indicate bug-fixes only
     */
    revision:parseInt("0", 10),

    /**
     * The build number increments for each build
     */
    build:parseInt("-1", 10),

    /**
     * Only used for non production releases to indicate the purpose/quality of
     * the release. Example titles include 'milestone1' or 'beta3'.
     */
    title:"FINAL",

    /**
     * The strings above concatenated
     */
    label:"3.0.0-FINAL"
  };

  //==============================================================================
  // Only private stuff below here
  //==============================================================================

  /** Keep track of page load initialization */
  dwr.engine._initializing = true;

  /** Is GET enabled? */
  dwr.engine._allowGetButMakeForgeryEasier = "false";

  /** The script prefix to strip in the case of scriptTagProtection. */
  dwr.engine._scriptTagProtection = "throw 'allowScriptTagRemoting is false.';";

  /** The default path to the DWR servlet */
  dwr.engine._pathToDwrServlet = contextPath+"/msg";

  /** Custom path to the DWR servlet */
  dwr.engine._overridePath = "";
  if (typeof pathToDwrServlet != "undefined") {
    dwr.engine._overridePath = pathToDwrServlet;
  }
  
  dwr.engine._effectivePath = function() {
    return dwr.engine._overridePath || dwr.engine._pathToDwrServlet;
  };

  /** The webapp's contextPath */
 dwr.engine._contextPath = contextPath;

  /** Custom contextPath */
  dwr.engine._overrideContextPath = "";

  dwr.engine._effectiveContextPath = function() {
    return dwr.engine._overrideContextPath || dwr.engine._contextPath;
  };

  /** Extra attributes to append to the DWRSESSIONID cookie (domain, secure, etc) */
  dwr.engine._cookieAttributes = "";

  /** Do we use XHR for reverse ajax because we are not streaming? */
  dwr.engine._useStreamingPoll = "true";

  dwr.engine._pollOnline = true;

  /** These URLs can be configured from the server */
  dwr.engine._ModePlainCall = "/call/plaincall/";
  dwr.engine._ModePlainPoll = "/call/plainpoll/";
  dwr.engine._ModeHtmlCall = "/call/htmlcall/";
  dwr.engine._ModeHtmlPoll = "/call/htmlpoll/";

  /** Do we make the calls async? Default to 'true' */
  dwr.engine._async = Boolean("true");

  /** The local page id */
  dwr.engine._pageId = null;

  /** The browser instance id */
  dwr.engine._dwrSessionId = null;

  /** The global page id (browser instance + local page id) */
  dwr.engine._scriptSessionId = ""; // we must use "" and not null

  /** A function to be called before requests are marshalled. Can be null. */
  dwr.engine._preHook = null;

  /** A function to be called after replies are received. Can be null. */
  dwr.engine._postHook = null;

  /** A map of the batches that we have sent and are awaiting a reply on. */
  dwr.engine._batches = {};

  /** A count of the number of outstanding batches. Should be == to _batches.length unless prototype has messed things up */
  dwr.engine._batchesLength = 0;

  /** In ordered mode, the array of batches waiting to be sent */
  dwr.engine._batchQueue = [];

  /** User setting for saying that calls should execute one by one in the order in which they were sent */
  dwr.engine._ordered = false;

  /** Internal state forcing calls to execute one by one in the order in which they were sent */
  dwr.engine._internalOrdered = false;

  /** The current batch (if we are in batch mode) */
  dwr.engine._batch = null;

  /** The global timeout */
  dwr.engine._timeout = 0;

  /** Are we doing comet or polling? */
  dwr.engine._activeReverseAjax = false;
  
  /** All reverse ajax scripts before this index have been received and executed */
  dwr.engine._nextReverseAjaxIndex = 0;
  
  /** Queue of reverse ajax scripts (functions) that have been received but not yet executed due to receiving in wrong order */
  dwr.engine._reverseAjaxQueue = {};
  
  /** The batch that we are using to poll */
  dwr.engine._pollBatch = null;

  /** Maximum time we wait for a poll to return (0 = no timeout) */
  dwr.engine._pollTimeout = 0;

  /** How many milliseconds between internal comet polls */
  dwr.engine._pollCometInterval = 200;

  /** How many times have we re-tried a call? */
  dwr.engine._retries = 1;
  dwr.engine._maxRetries = -1;

  /** The intervals between successive retries in seconds */
  dwr.engine._retryIntervals = [];

  /** Used as the default for reverse ajax/polling
   *  Retry immediately twice with one second intervals between, then go offline.
   *  Retry every 10 seconds when offline.
   */
  dwr.engine._defaultRetryIntervals = [ 1, 3, 3 ];

  dwr.engine._textHtmlHandler = null;

  /** If you wish to send custom headers with every request */
  dwr.engine._headers = null;

  /** If you wish to send extra custom request attributes with each request */
  if (typeof attributes != "undefined") {
    dwr.engine._attributes = attributes;
  }
  else {
    dwr.engine._attributes = null;
  }

  /** Batch ids allow us to know which batch the server is answering */
  dwr.engine._nextBatchId = 0;

  /** The instance id helps us distinguish multiple engine.js loaded in one page */
  dwr.engine._instanceId = -1;

  /** A list of the properties that need merging from calls to a batch */
  dwr.engine._propnames = [ "async", "timeout", "errorHandler", "warningHandler", "textHtmlHandler" ];

  /** Do we stream, or can be hacked to do so? */
  dwr.engine._partialResponseNo = 0;
  dwr.engine._partialResponseYes = 1;

  /** Are we notifying the server on page unload? */
  dwr.engine._isNotifyServerOnPageUnload = false;

  /** Are we notifying the server on page load? */
  dwr.engine._isNotifyServerOnPageLoad = false;
  dwr.engine._isNotifyServerOnPageLoadSent = false;

  /** Should the unload call be asynchronous?  If true it may not be called by the browser. */
  dwr.engine._asyncUnload = false;

  /**
   * A map of all mapped classes whose class declarations have been loaded
   * (dwrClassName -> constructor function)
   */
  dwr.engine._mappedClasses = {};

  /** A function to call if something fails. */
  dwr.engine._errorHandler = dwr.engine.defaultErrorHandler;

  /** For debugging when something unexplained happens. */
  dwr.engine._warningHandler = dwr.engine.defaultWarningHandler;

  dwr.engine._pollStatusHandler = dwr.engine.defaultPollStatusHandler;

  /** Undocumented interceptors - do not use */
  dwr.engine._postSeperator = "\n";
  dwr.engine._defaultInterceptor = function(data) { return data; };
  dwr.engine._urlRewriteHandler = dwr.engine._defaultInterceptor;
  dwr.engine._contentRewriteHandler = dwr.engine._defaultInterceptor;
  dwr.engine._replyRewriteHandler = dwr.engine._defaultInterceptor;

  /** Object attributes to ignore when serializing */
  dwr.engine._excludeObjectAttributes = {
    "$dwrClassName": true,
    "$dwrByRef": true,
    "$_dwrConversionRef": true
  };

  dwr.engine._ieConditions = {};
  
  /** Is this page doing beforeunload processing? */
  dwr.engine._beforeUnloading = false;

  /** A place to temporarily store exception before reporting */
  dwr.engine._queuedBatchException = null;

  /** @private Keep beforeunload flag set during beforeunload processing (including potential
   *  "Are you sure?" popups). */
  dwr.engine._beforeUnloader = function() {
    dwr.engine._beforeUnloading = true;
    // We want to reset the flag if unloading is aborted by "Are you sure?" popup. We detect
    // return to interactive mode with a timeout that normally will execute directly after
    // unload is aborted through popup.
    setTimeout(function() {
      // Some browsers (f ex Firefox) will execute the timeout even if unload is not aborted.
      // To keep a continuous unloading state we therefore prolong the beforeunload state for
      // a second so the unload flag gets time to trigger.
      setTimeout(function() {
        dwr.engine._beforeUnloading = false;
      }, 1000);
    }, 1);
  };

  /** Is this page in the process of unloading? */
  dwr.engine._unloading = false;

  /** @private Abort any XHRs in progress at page unload (solves zombie socket problems in IE). */
  dwr.engine._unloader = function() {
    dwr.engine._unloading = true;

    // Empty queue of waiting ordered requests
    dwr.engine._batchQueue.length = 0;

    // Abort any ongoing requests and clear their batches
    var batch;
    for (var batchId in dwr.engine._batches) {
      batch = dwr.engine._batches[batchId];
      if (batch.transport && batch.transport.abort) {
        batch.transport.abort(batch);
      }
    }

    // If we have used reverse ajax then we try to tell the server we are gone
    if (dwr.engine._isNotifyServerOnPageUnload) {
      dwr.engine._debug("calling unloader for: " + dwr.engine._scriptSessionId);
      batch = {
        map:{
          callCount:1,
          'c0-scriptName':'__System',
          'c0-methodName':'pageUnloaded',
          'c0-id':0
        },
        paramCount:0, isPoll:false, async:dwr.engine._asyncUnload,
        headers:{}, preHooks:[], postHooks:[],
        timeout:dwr.engine._timeout,
        errorHandler:null, globalErrorHandler:dwr.engine._errorHandler, warningHandler:null, textHtmlHandler:null, globalTextHtmlHandler:null,
        handlers:[{ exceptionHandler:null, callback:null }]
      };
      dwr.engine.transport.send(batch);
      dwr.engine._isNotifyServerOnPageUnload = false;
    }
  };

  function ignoreIfUnloading(batch, f) {
    // Do nothing if we are unloading
    if (dwr.engine._unloading) return;
    // Retry later if beforeunload is in progress and this is not a sync call
    if (dwr.engine._beforeUnloading && (batch == null || batch.async)) {
      setTimeout(function() {
        ignoreIfUnloading(batch, f);
      }, 100);
    }
    // Otherwise trigger the target func
    else {
      return f();
    }
  }

  dwr.engine._initializer = {
    /*
     * Load-time initializations
     */
    preInit: function() {
      // Make random local page id
      dwr.engine._pageId = dwr.engine.util.tokenify(new Date().getTime()) + "-" + dwr.engine.util.tokenify(Math.random() * 1E16);

      // Reuse any existing dwr session
      dwr.engine.transport.updateDwrSessionFromCookie();

      // Register unload handlers
      dwr.engine.util.addEventListener(window, 'beforeunload', dwr.engine._beforeUnloader);
      dwr.engine.util.addEventListener(window, 'unload', dwr.engine._unloader);

      // Register this engine instance globally
      var g = dwr.engine._global;
      if (!g.dwr) g.dwr = {};
      if (!g.dwr._) g.dwr._ = [];
      dwr.engine._instanceId = g.dwr._.length;
      g.dwr._[dwr.engine._instanceId] = dwr;
    },

    loadDwrConfig: function() {
      if (typeof dwrConfig != "undefined") {
        for(p in dwrConfig) {
          var methodName = "set" + p.charAt(0).toUpperCase() + p.substring(1);
          var setter = dwr.engine[methodName];
          if (setter) setter(dwrConfig[p]);
        }
      }
    },
    
    init: function() {
      dwr.engine._initializer.preInit();
      dwr.engine._initializer.loadDwrConfig();
      dwr.engine._initializing = false;
      // Now we can start sending requests
      if (dwr.engine._isNotifyServerOnPageLoad) {
        eval("dwr.engine._execute(dwr.engine._pathToDwrServlet, '__System', 'pageLoaded', [ function() { dwr.engine._ordered = false; }]);");
        dwr.engine._isNotifyServerOnPageLoadSent = true;
      }
      if (dwr.engine._activeReverseAjax) {
        dwr.engine._poll();
      }
    }
  };

  /**
   * Send a request. Called by the JavaScript interface stub
   * @private
   * @param path part of URL after the host and before the exec bit without leading or trailing /s
   * @param scriptName The class to execute
   * @param methodName The method on said class to execute
   * @param func The callback function to which any returned data should be passed
   *       if this is null, any returned data will be ignored
   * @param args The parameters to passed to the above method
   */
  dwr.engine._execute = function(overridePath, scriptName, methodName, args) {
    var path = overridePath || dwr.engine._effectivePath();
    dwr.engine._singleShot = false;
    if (dwr.engine._batch == null) {
      dwr.engine.beginBatch();
      dwr.engine._singleShot = true;
    }

    var batch = dwr.engine._batch;
    // All the paths MUST be to the same servlet
    if (batch.path == null) {
      batch.path = path;
    }
    else {
      if (batch.path != path) {
        dwr.engine._handleError(batch, { name:"dwr.engine.multipleServlets", message:"Can't batch requests to multiple DWR Servlets." });
        return;
      }
    }

    dwr.engine.batch.addCall(batch, scriptName, methodName, args);

    // Now we have finished remembering the call, we increment the call count
    batch.map.callCount++;
    if (dwr.engine._singleShot) {
      return dwr.engine.endBatch();
    }
  };

  /**
   * Poll the server to see if there is any data waiting
   * @private
   */
  dwr.engine._poll = function() {
    if (!dwr.engine._activeReverseAjax) {
      return;
    }
    dwr.engine._pollBatch = dwr.engine.batch.createPoll();
    dwr.engine.transport.send(dwr.engine._pollBatch);
  };

  /** @private Utility to execute incoming scripts */
  dwr.engine._executeScript = function(script) {
    if (script == null) {
      return null;
    }
    if (script === "") {
      dwr.engine._debug("Warning: blank script", true);
      return null;
    }
    // Using Function instead of eval as the latter has memory problems on IE9
    (new Function("dwr", script))(dwr);
  };

  /** @private call all the post hooks for a batch */
  dwr.engine._callPostHooks = function(batch) {
    if (batch.postHooks) {
      for (var i = 0; i < batch.postHooks.length; i++) {
        batch.postHooks[i]();
      }
      batch.postHooks = null;
    }
  };

  /**
   * Is this a batch that is checking for a heartbeat?
   * If so we want to ignore errors/warnings, etc.
   * @private
   * @param {Object} batch
   */
  dwr.engine._isHeartbeatBatch = function(batch) {
    return (batch.map && batch.map['c0-methodName'] === 'checkHeartbeat' && batch.map['c0-scriptName'] === '__System');
  };

  /**
   * Generic error handling routing to save having null checks everywhere
   * @private
   * @param {Object} batch
   * @param {Object} ex
   */
  dwr.engine._handleError = function(batch, ex) {
    if (batch && dwr.engine._isHeartbeatBatch(batch)) { // Ignore errors that happen while checking for a heartbeat.
      return;
    }
    var errorHandlers = [];
    var anyCallWithoutErrorHandler = false;
    if (batch && batch.isPoll) { // No error reporting and only retry for polls
      dwr.engine._handlePollRetry(batch, ex);
    } else {
      // Perform error cleanup synchronously
      if (batch) {
        for (var i = 0; i < batch.map.callCount; i++) {
          var handlers = batch.handlers[i];
          if (!handlers.completed) {
            if (typeof handlers.errorHandler == "function")
              errorHandlers.push(handlers.errorHandler);
            else
              anyCallWithoutErrorHandler = true;
            handlers.completed = true;
          }
        }
      }
      // Perform error reporting asynchronously (possibly)
      ignoreIfUnloading(batch, function() {
        if (batch) {
          var textHtmlHandler = batch.textHtmlHandler || batch.globalTextHtmlHandler;
          if (ex.name === "dwr.engine.textHtmlReply" && textHtmlHandler) {
            dwr.engine.util.logHandlerEx(function() {
              textHtmlHandler(ex);
            });
            return;
          }
        }
        dwr.engine._prepareException(ex);
        var errorHandler;
        while(errorHandlers.length > 0) {
          errorHandler = errorHandlers.shift();
          dwr.engine.util.logHandlerEx(function() {
            errorHandler(ex.message, ex);
          });
        }
        if (batch) {
          dwr.engine.util.logHandlerEx(function() {
            if (typeof batch.errorHandler == "function") batch.errorHandler(ex.message, ex);
            else if (anyCallWithoutErrorHandler) {
              if (typeof batch.globalErrorHandler == "function") batch.globalErrorHandler(ex.message, ex);
            }
          });
          dwr.engine.batch.remove(batch);
        }
      });
    }
  };

  /**
   * Handle retries for polling as well as online/offline status.
   * @private
   * @param {Object} batch
   * @param {Object} ex
   */
  dwr.engine._handlePollRetry = function(batch, ex) {
      var retryInterval = dwr.engine._getRetryInterval();
      // If number of retries is equal to the retryIntervals array length, call the supplied pollStatusHandler and go offline.
      if (dwr.engine._retries === dwr.engine._retryIntervals.length - 1) {
        dwr.engine._debug("poll retry - going offline: " + retryInterval/1000 + " seconds");
        dwr.engine._handlePollStatusChange(false, ex, batch);
        // We are offline, continue to check for a heartbeat until _retries is > _maxRetries.
        var heartbeatInterval = setInterval(function() {
          if (dwr.engine._maxRetries === -1 || dwr.engine._retries < dwr.engine._maxRetries) {
            dwr.engine._execute(null, '__System', 'checkHeartbeat', [ function() {
              // We found a heartbeat, we are back online!
              clearInterval(heartbeatInterval);
              dwr.engine._poll();
            }]);
            dwr.engine._retries++;
            dwr.engine._debug("DWR Offline - poll retry - interval: " + retryInterval/1000 + " seconds");
          } else {
            // maxRetries has been reached, stop the heartbeat check.
            clearInterval(heartbeatInterval);
            dwr.engine._debug("max retries reached, stop polling for server status.");
            dwr.engine._handlePollStatusChange(false, ex, batch);
          }
        }, retryInterval);
      } else { // We are still online, poll again.
        dwr.engine._retries++;
        dwr.engine.batch.remove(batch);
        dwr.engine._debug("DWR Online - poll retry - interval: " + retryInterval/1000 + " seconds");
        setTimeout(dwr.engine._poll, retryInterval);
      }
  };

  dwr.engine._getRetryInterval = function() {
    var retryInterval;
    if (dwr.engine._retries < dwr.engine._retryIntervals.length) {
      retryInterval = dwr.engine._retryIntervals[dwr.engine._retries] * 1000;
    } else {
      // The last interval in retryIntervals is the number that will be used to poll when offline.
      retryInterval = dwr.engine._retryIntervals[dwr.engine._retryIntervals.length - 1] * 1000;
    }
    return retryInterval;
  };

  /**
   * Handles polling status changes - online or offline.
   * @param {boolean} newStatus - true = online, false = offline
   * @param {object} ex - The exception if one exists (offline).
   */
  dwr.engine._handlePollStatusChange = function(newStatus, ex, batch) {
  if (batch.isPoll || dwr.engine._isHeartbeatBatch(batch)) {
      var changed = dwr.engine._pollOnline !== newStatus;
      var maxRetriesReached = dwr.engine._maxRetries === dwr.engine._retries;
      dwr.engine._pollOnline = newStatus;
      if ((changed || maxRetriesReached) && typeof dwr.engine._pollStatusHandler === "function") 
        dwr.engine.util.logHandlerEx(function() {
          dwr.engine._pollStatusHandler(newStatus, ex, maxRetriesReached);
        });
      if (newStatus) {
        dwr.engine._retries = 1;
      }
  }
  };

  /**
   * Generic error handling routing to save having null checks everywhere.
   * @private
   * @param {Object} batch
   * @param {Object} ex
   */
  dwr.engine._handleWarning = function(batch, ex) {
    if (batch && dwr.engine._isHeartbeatBatch(batch)) { // Ignore warnings that happen while checking for a heartbeat.
      return;
    }
    ignoreIfUnloading(batch, function() {
      // If this is a poll, we should retry!
      dwr.engine._prepareException(ex);
      dwr.engine.util.logHandlerEx(function() {
        if (batch && typeof batch.warningHandler == "function") batch.warningHandler(ex.message, ex);
        else if (dwr.engine._warningHandler) dwr.engine._warningHandler(ex.message, ex);
      });
      if (batch) dwr.engine.batch.remove(batch);
    });
  };

  /**
   * Prepares an exception for an error/warning handler.
   * @private
   * @param {Object} ex
   */
  dwr.engine._prepareException = function(ex) {
    if (typeof ex == "string") ex = { name:"unknown", message:ex };
    if (ex.message == null) ex.message = "";
    if (ex.name == null) ex.name = "unknown";
  };

  /**
   * Create a new object that delegates to obj
   * @param obj
   */
  dwr.engine._delegate = (function() {
    function F(){}
    return (function(obj){
      F.prototype = obj;
      return new F();
    });
  })();

  /**
   * Create a new object that delegates to obj
   * @param obj
   */
  dwr.engine._createFromMap = function(map) {
    var obj = new this(); // this should be set to a constructor function!
    for(prop in map) if (map.hasOwnProperty(prop)) obj[prop] = map[prop];
    return obj;
  };

  /**
   * A reference to the global context (window when in a browser)
   */
  dwr.engine._global = (function(){return this;}).call(null);

  /**
   * Navigates properties from the global scope and down to fetch a property
   * value.
   * @param prop hierarchical property name
   * @return property value, or undefined if doesn't exist
   */
  dwr.engine._getObject = function(prop) {
    var parts = prop.split(".");
    var value = undefined;
    var scope = dwr.engine._global;
    while(parts.length > 0) {
      var currprop = parts.shift();
      if (!scope) return undefined;
      value = scope[currprop];
      if (value && value.tagName && document.getElementById(currprop) == value) return undefined;
      scope = value;
    }
    return value;
  };

  /**
   * Navigates properties from the global scope and down to set a value.
   * @param prop hierarchical property name
   * @param obj property value to set
   */
  dwr.engine._setObject = function(prop, obj) {
    var parts = prop.split(".");
    var level;
    var scope = dwr.engine._global;
    while(parts.length > 0) {
      var currprop = parts.shift();
      if (parts.length === 0) {
        scope[currprop] = obj;
      }
      else {
        level = scope[currprop];
        if (level == null || level.tagName && document.getElementById(currprop) == level) {
          scope[currprop] = level = {};
        }
        scope = level;
      }
    }
  };

  /**
   * Used internally when some message needs to get to the programmer
   * @private
   * @param {String} message
   * @param {Object} stacktrace
   */
  dwr.engine._debug = function(message, stacktrace) {
    var written = false;
    try {
      if (window.console) {
        if (stacktrace && window.console.trace) window.console.trace();
        if (window.console.log) window.console.log(message);
        written = true;
      }
      else if (window.opera && window.opera.postError) {
        window.opera.postError(message);
        written = true;
      }
    }
    catch (ex) { /* ignore */ }

    if (!written) {
      var debug = document.getElementById("dwr-debug");
      if (debug) {
        var contents = message + "<br/>" + debug.innerHTML;
        if (contents.length > 2048) contents = contents.substring(0, 2048);
        debug.innerHTML = contents;
      }
    }
  };

  /**
   * Functions called by the server
   */
  dwr.engine.remote = {
    /**
     * Execute a callback
     * @private
     * @param {int} batchId The ID of the batch that we are replying to
     * @param {int} callId The call ID that the script relates to
     * @param {String} reply The script to execute
     */
    handleCallback:function(batchId, callId, reply) {
      var batch = dwr.engine._batches[batchId];
      if (!batch) return;

      // We store the reply in the batch so we can return the data when in sync mode
      batch.reply = reply;

      // Error handlers inside here indicate an error that is nothing to do
      // with DWR so we handle them differently.
      try {
        var handlers = batch.handlers[callId];
        if (!handlers) {
          dwr.engine._debug("Warning: Missing handlers. callId=" + callId, true);
        }
        else {
          batch.handlers[callId].completed = true;
          if (typeof handlers.callback == "function") {
            dwr.engine.util.logHandlerEx(function() {
              if(handlers.callbackArg !== undefined)
        	    handlers.callback.call(handlers.callbackScope, reply, handlers.callbackArg);
              else
                handlers.callback.call(handlers.callbackScope, reply);
            });
          }
        }
      }
      catch (ex) {
        dwr.engine._handleError(batch, ex);
      }
    },

    /**
     * Called by the server when a JavascriptFunction is executed
     * @param id The ID of the serialized function
     * @param args The arguments to pass to the function
     */
    handleFunctionCall:function(id, args) {
      var func = dwr.engine.serialize.remoteFunctions[id];
      func.apply(window, args);
    },

    /**
     * Called by the server when a JavascriptFunction is executed
     * @param id The ID of the serialized function
     * @param args The arguments to pass to the function
     */
    handleObjectCall:function(id, methodName, args) {
      var obj = dwr.engine.serialize.remoteFunctions[id];
      obj[methodName].apply(obj, args);
    },

    /**
     * Called by the server when a JavascriptFunction is executed
     * @param propertyName The ID of the serialized function
     * @param data The arguments to pass to the function
     */
    handleSetCall:function(id, propertyName, data) {
      var obj = dwr.engine.serialize.remoteFunctions[id];
      obj[propertyName] = data;
    },

    /**
     * Called by the server when a JavascriptFunction is closed
     * @param id The ID of the serialized function
     */
    handleFunctionClose:function(id) {
      delete dwr.engine.serialize.remoteFunctions[id];
    },

    /**
     * Called by the server: Handle an exception for a call
     * @private
     * @param {int} batchId The ID of the batch that we are replying to
     * @param {int} callId The call ID that the script relates to
     * @param {String} reply The script to execute
     */
    handleException:function(batchId, callId, ex) {
      var batch = dwr.engine._batches[batchId];
      if (!batch) return;

      var handlers = batch.handlers[callId];
      batch.handlers[callId].completed = true;
      if (handlers == null) {
        dwr.engine._debug("Warning: null handlers in remoteHandleException", true);
        return;
      }

      if (ex.message === undefined) {
        ex.message = "";
      }

      dwr.engine.util.logHandlerEx(function() {
        if (typeof handlers.exceptionHandler == "function") {
          if (handlers.exceptionArg !== undefined)
            handlers.exceptionHandler.call(handlers.exceptionScope, ex.message, ex, handlers.exceptionArg);
          else
            handlers.exceptionHandler.call(handlers.exceptionScope, ex.message, ex);
        }
        else if (typeof handlers.errorHandler == "function") {
          handlers.errorHandler(ex.message, ex);
        }
        else if (typeof batch.errorHandler == "function") {
          batch.errorHandler(ex.message, ex);
        }
        else if (typeof batch.globalErrorHandler == "function") {
          batch.globalErrorHandler(ex.message, ex);
        }
      });
    },

    /**
     * Called by the server when a new Reverse Ajax script arrives
     */
    handleReverseAjax:function(reverseAjaxIndex, reverseAjaxFunc) {
      if (reverseAjaxIndex < dwr.engine._nextReverseAjaxIndex) return;
      dwr.engine._reverseAjaxQueue[reverseAjaxIndex] = reverseAjaxFunc;
      while(true) {
        var nextFunc = dwr.engine._reverseAjaxQueue[dwr.engine._nextReverseAjaxIndex];
        if (!nextFunc) return;
        dwr.engine.util.logHandlerEx(function() {
          nextFunc();
        });
        delete dwr.engine._reverseAjaxQueue[dwr.engine._nextReverseAjaxIndex];
        dwr.engine._nextReverseAjaxIndex++;
      }
    },
    
    /**
     * Called by the server: The whole batch is broken
     * @private
     * @param {Object} ex The data about what broke
     * @param {int} batchId The ID of the batch that we are replying to
     */
    handleBatchException:function(ex, batchId) {
      var batch = dwr.engine._batches[batchId];
      if (ex.message === undefined) ex.message = "";
      if (batch) {
        dwr.engine._handleError(batch, ex);
      } else {
        dwr.engine._queuedBatchException = ex;
      }
    },

    /**
     * Called by the server: Reverse ajax should not be used
     * @private
     * @param {Object} ex
     * @param {int} batchId
     */
    pollCometDisabled:function(ex, batchId){
      dwr.engine.setActiveReverseAjax(false);
      var batch = dwr.engine._batches[batchId];
      if (ex.message === undefined) {
        ex.message = "";
      }
      dwr.engine._handleError(batch, ex);
    },

    /**
     * Called by the server: Create a new object of a mapped class
     * @private
     * @param {string} dwrClassName the name of the mapped class
     * @param {Object} memberMap the object's data members
     */
    newObject:function(dwrClassName, memberMap){
      var classfunc = dwr.engine._mappedClasses[dwrClassName];
      if (classfunc && classfunc.createFromMap) {
        return classfunc.createFromMap(memberMap);
      }
      else {
        memberMap.$dwrClassName = dwrClassName;
        return memberMap;
      }
    }
  };

  /**
   * Functions to serialize a data set into a list of parameters
   */
  dwr.engine.serialize = {
    /**
     * ActiveX objects to use when we want to convert an xml string into a DOM object
     */
    domDocument:[
      "Msxml2.DOMDocument.6.0",
      "Msxml2.DOMDocument.5.0",
      "Msxml2.DOMDocument.4.0",
      "Msxml2.DOMDocument.3.0",
      "MSXML2.DOMDocument",
      "MSXML.DOMDocument",
      "Microsoft.XMLDOM"
    ],

    /**
     * A holder for functions that we have serialized for remote calling.
     */
    remoteFunctions:{},

    /**
     * The ID of the next function that we serialize
     */
    funcId:0,

    /**
     * Convert a text representation of XML into a DOM element
     * @param {String} xml An xml string
     */
    toDomElement:function(xml) {
      return dwr.engine.serialize.toDomDocument(xml).documentElement;
    },

    /**
     * Convert a text representation of XML into a DOM document
     * @param {String} xml An xml string
     */
    toDomDocument:function(xml) {
      var dom;
      if (window.DOMParser) {
        var parser = new DOMParser();
        dom = parser.parseFromString(xml, "text/xml");
        if (!dom.documentElement || dom.documentElement.tagName == "parsererror") {
          var message = dom.documentElement.firstChild.data;
          message += "\n" + dom.documentElement.firstChild.nextSibling.firstChild.data;
          throw message;
        }
        return dom;
      }
      else if (window.ActiveXObject) {
        dom = dwr.engine.util.newActiveXObject(dwr.engine.serialize.domDocument);
        dom.loadXML(xml); // What happens on parse fail with IE?
        return dom;
      }
      else {
        var div = document.createElement("div");
        div.innerHTML = xml;
        return div;
      }
    },

    /**
     * Marshall a data item
     * @private
     * @param batch A map of variables to how they have been marshalled
     * @param directrefmap A map of already marshalled variables to prevent recurrsion (these have direct links from their data object)
     * @param otherrefmap A map of already marshalled variables to prevent recursion (these have no links from data objects)
     * @param data The data to be marshalled
     * @param name The name of the data being marshalled
     */
    convert:function(batch, directrefmap, otherrefmap, data, name, depth) {
      if (data == null) {
        batch.map[name] = "null:null";
        return;
      }

      switch (typeof data) {
      case "boolean":
        batch.map[name] = "boolean:" + data;
        break;
      case "number":
        batch.map[name] = "number:" + data;
        break;
      case "string":
        batch.map[name] = "string:" + encodeURIComponent(data);
        break;
      case "object":
        var ref = dwr.engine.serialize.lookup(directrefmap, otherrefmap, data, name);
        var objstr = Object.prototype.toString.call(data);
        if (data.$dwrByRef) batch.map[name] = dwr.engine.serialize.convertByReference(batch, directrefmap, otherrefmap, data, name, depth + 1);
        else if (ref != null) batch.map[name] = ref;
        else if (objstr == "[object String]") batch.map[name] = "string:" + encodeURIComponent(data);
        else if (objstr == "[object Boolean]") batch.map[name] = "boolean:" + data;
        else if (objstr == "[object Number]") batch.map[name] = "number:" + data;
        else if (objstr == "[object Date]") batch.map[name] = "date:" + data.getTime();
        else if (objstr == "[object Array]") batch.map[name] = dwr.engine.serialize.convertArray(batch, directrefmap, otherrefmap, data, name, depth + 1);
        else if (data && data.tagName && data.tagName.toLowerCase() == "input" && data.type && data.type.toLowerCase() == "file") {
          batch.fileUpload = true;
          batch.map[name] = data;
        }
        else {
          // This check for an HTML is not complete, but is there a better way?
          // Maybe we should add: data.hasChildNodes typeof "function" == true
          if (data.nodeName && data.nodeType) {
            batch.map[name] = dwr.engine.serialize.convertDom(data);
          }
          else {
            batch.map[name] = dwr.engine.serialize.convertObject(batch, directrefmap, otherrefmap, data, name, depth + 1);
          }
        }
        break;
      case "function":
        // Ignore functions unless they are directly passed in
        if (depth === 0) {
          batch.map[name] = dwr.engine.serialize.convertByReference(batch, directrefmap, otherrefmap, data, name, depth + 1);
        }
        break;
      default:
        dwr.engine._handleWarning(null, { name:"dwr.engine.unexpectedType", message:"Unexpected type: " + typeof data + ", attempting default converter." });
        batch.map[name] = "default:" + data;
        break;
      }
    },

    /**
     * Marshall an object by reference
     * @private
     * @see dwr.engine.serialize.convert() for parameter details
     */
    convertByReference:function(batch, directrefmap, otherrefmap, data, name, depth) {
      var funcId = "f" + dwr.engine.serialize.funcId;
      dwr.engine.serialize.remoteFunctions[funcId] = data;
      dwr.engine.serialize.funcId++;
      return "byref:" + funcId;
    },

    /**
     * Marshall an array
     * @private
     * @see dwr.engine.serialize.convert() for parameter details
     */
    convertArray:function(batch, directrefmap, otherrefmap, data, name, depth) {
      var childName, i;
      if (dwr.engine.util.ieCondition("if lte IE 7")) {
        // Use array joining on IE1-7 (fastest)
        var buf = ["array:["];
        for (i = 0; i < data.length; i++) {
          if (i !== 0) buf.push(",");
          batch.paramCount++;
          childName = "c" + dwr.engine._batch.map.callCount + "-e" + batch.paramCount;
          dwr.engine.serialize.convert(batch, directrefmap, otherrefmap, data[i], childName, depth + 1);
          buf.push("reference:");
          buf.push(childName);
        }
        buf.push("]");
        reply = buf.join("");
      }
      else {
        // Use string concat on other browsers (fastest)
        var reply = "array:[";
        for (i = 0; i < data.length; i++) {
          if (i !== 0) reply += ",";
          batch.paramCount++;
          childName = "c" + dwr.engine._batch.map.callCount + "-e" + batch.paramCount;
          dwr.engine.serialize.convert(batch, directrefmap, otherrefmap, data[i], childName, depth + 1);
          reply += "reference:";
          reply += childName;
        }
        reply += "]";
      }

      return reply;
    },

    /**
     * Marshall an object by value
     * @private
     * @see dwr.engine.serialize.convert() for parameter details
     */
    convertObject:function(batch, directrefmap, otherrefmap, data, name, depth) {
      // treat objects as an associative arrays
      var reply = "Object_" + dwr.engine.serialize.getObjectClassName(data).replace(/:/g, "?") + ":{";
      var elementset = (data.constructor && data.constructor.$dwrClassMembers ? data.constructor.$dwrClassMembers : data);
      var element;
      for (element in elementset) {
        if (typeof data[element] != "function" && !dwr.engine._excludeObjectAttributes[element]) {
          batch.paramCount++;
          var childName = "c" + dwr.engine._batch.map.callCount + "-e" + batch.paramCount;
          dwr.engine.serialize.convert(batch, directrefmap, otherrefmap, data[element], childName, depth + 1);
          reply += encodeURIComponent(element) + ":reference:" + childName + ", ";
        }
      }

      if (reply.substring(reply.length - 2) == ", ") {
        reply = reply.substring(0, reply.length - 2);
      }
      reply += "}";

      return reply;
    },

    /**
     * Marshall an object
     * @private
     * @see dwr.engine.serialize.convert() for parameter details
     */
    convertDom:function(data) {
      return "xml:" + encodeURIComponent(dwr.engine.serialize.serializeDom(data));
    },
    serializeDom:function(data) {
      var output;
      if (window.XMLSerializer) output = new XMLSerializer().serializeToString(data);
      else if (data.xml) output = data.xml;
      else throw new Error("The browser doesn't support XML serialization of: " + data);
      return output;
    },

    /**
     * Have we already converted this object?
     * @private
     * @see dwr.engine.serialize.convert() for parameter details
     */
    lookup:function(directrefmap, otherrefmap, data, name) {
      // Look for reference to previous conversion
      var ref;
      if ("$_dwrConversionRef" in data) {
        ref = data.$_dwrConversionRef;
        if (ref && directrefmap[ref] != data) ref = null;
      }
      if (ref == null) {
        for(r in otherrefmap) {
          if (otherrefmap[r] == data) {
            ref = r;
            break;
          }
        }
      }
      if (ref != null) return "reference:" + ref;
      // This was a new conversion - save the reference!
      try {
        data.$_dwrConversionRef = name;
        directrefmap[name] = data;
      }
      catch(err) {
        otherrefmap[name] = data;
      }
      return null;
    },

    /**
     * Clean up our conversion markers from user data
     * @private
     */
    cleanup:function(directrefmap) {
      for(var refName in directrefmap) {
        var data = directrefmap[refName];
        try {
          delete data.$_dwrConversionRef;
        }
        catch(err) {
          data.$_dwrConversionRef = undefined;
        }
      }
    },

    /**
     * Returns the classname of supplied argument obj. Similar to typeof, but
     * which returns the name of the constructor that created the object rather
     * than 'object'
     * @private
     * @param {Object} obj The object to detect the type of
     * @return The name of the object
     */
    getObjectClassName:function(obj) {
      // Different handling depending on if, and what type of, class-mapping is used
      if (obj.$dwrClassName)
        return obj.$dwrClassName; // Light class-mapping uses the classname from a property on the instance
      else if (obj.constructor && obj.constructor.$dwrClassName)
        return obj.constructor.$dwrClassName; // Full class-mapping uses the classname from a property on the constructor function
      else
        return "Object";
    }
  };

  /**
   * Functions to handle the various remoting transport
   */
  dwr.engine.transport = {
    /**
     * Manage the DWR session and then send.
     * @private
     * @param {Object} batch
     */
    send:function(batch) {
      if (batch.path == null) {
        batch.path = dwr.engine._effectivePath();
      }
      dwr.engine.transport.updateDwrSessionFromCookie();
      if (!dwr.engine._dwrSessionId) {
        dwr.engine._internalOrdered = true;
        var retval;
        var idbatch = {
          map:{
            callCount:1,
            'c0-scriptName':'__System',
            'c0-methodName':'generateId',
            'c0-id':0
          },
          paramCount:0, isPoll:false, async:batch.async,
          headers:{}, preHooks:[],
          postHooks:[function() {
            dwr.engine._internalOrdered = false;
          }],
          timeout:dwr.engine._timeout,
          errorHandler:batch.errorHandler, globalErrorHandler:batch.globalErrorHandler, warningHandler:batch.warningHandler, textHtmlHandler:batch.textHtmlHandler, globalTextHtmlHandler:batch.globalTextHtmlHandler,
          path:batch.path,
          handlers:[{
            exceptionHandler:null,
            callback:function(id) {
              dwr.engine.transport.updateDwrSessionFromCookie();
              if (!dwr.engine._dwrSessionId) {
                dwr.engine.transport.setDwrSession(id);
              }
              retval = dwr.engine.transport.send2(batch);
            }
          }]
        };
        dwr.engine.transport.send2(idbatch);
        return retval;
      }
      else {
        return dwr.engine.transport.send2(batch);
      }
    },

    /**
     * Actually send the block of data in the batch object.
     * @private
     * @param {Object} batch
     */
    send2:function(batch) {
      dwr.engine.batch.prepareToSend(batch);

      // Work out if we are going cross domain
      var isCrossDomain = false;
      if (batch.path.indexOf("http://") === 0 || batch.path.indexOf("https://") === 0) {
        var dwrShortPath = batch.path.split("/", 3).join("/");
        var hrefShortPath = window.location.href.split("/", 3).join("/");
        isCrossDomain = (dwrShortPath != hrefShortPath);
      }

      if (batch.fileUpload) {
        if (isCrossDomain) {
          throw new Error("Cross domain file uploads are not possible with this release of DWR");
        }
        batch.transport = dwr.engine.transport.iframe;
      }
      else if (isCrossDomain) {
        batch.transport = dwr.engine.transport.scriptTag;
      }
      else if (batch.isPoll && dwr.engine._useStreamingPoll == "true" && dwr.engine.util.ieCondition("if (IE 8)|(IE 9)")) {
        batch.transport = dwr.engine.transport.iframe;
      }
      else {
        batch.transport = dwr.engine.transport.xhr;
      }

      return batch.transport.send(batch);
    },

    /**
     * Called to signal that the batch response has been delivered
     */
    complete:function(batch) {
        dwr.engine.batch.validate(batch);
        dwr.engine.transport.remove(batch);
    },

    /**
     * Called as a result of a request timeout
     * @private
     * @param {Object} batch The batch that is aborting
     */
    abort:function(batch) {
      var transport = batch.transport;
      if (transport.abort) {
        transport.abort(batch);
      }
      dwr.engine.transport.remove(batch);
    },

    /**
     * Remove all remoting artifacts
     * @param {Object} batch The batch that has completed
     */
    remove:function(batch) {
      if (batch.transport) {
        dwr.engine._callPostHooks(batch);
        batch.transport.remove(batch);
        batch.transport = null;
      }
      dwr.engine.batch.remove(batch);
    },

    setDwrSession:function(dwrsess) {
      dwr.engine._dwrSessionId = dwrsess;
      var attrs = "";
      if (!dwr.engine._cookieAttributes.match(/^path=/i)) {
        attrs = "; path=" + (dwr.engine._effectiveContextPath() || "/");
      }
      if (dwr.engine._cookieAttributes) {
        attrs += "; " + dwr.engine._cookieAttributes;
      }
      document.cookie = "DWRSESSIONID=" + dwrsess + attrs;
      dwr.engine._scriptSessionId = dwrsess + "/" + dwr.engine._pageId;
    },

    updateDwrSessionFromCookie:function() {
      if (!dwr.engine._dwrSessionId) {
        var match = document.cookie.match(/(?:^|; )DWRSESSIONID=([^;]+)/);
        if (match) {
          dwr.engine.transport.setDwrSession(match[1]);
        }
      }
    },

    /**
     * Remoting through XHR
     */
    xhr:{
      /**
       * The default HTTP method to use
       */
      httpMethod:"POST",

      /**
       * The ActiveX objects to use when we want to do an XMLHttpRequest call.
       * TODO: We arrived at this by trial and error. Other toolkits use
       * different strings, maybe there is an officially correct version?
       */
      XMLHTTP:["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.5.0", "Msxml2.XMLHTTP.4.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"],

      /**
       * Setup a batch for transfer through XHR
       * @param {Object} batch The batch to alter for XHR transmit
       */
      send:function(batch) {
        if (batch.isPoll) {
          batch.map.partialResponse = dwr.engine._partialResponseYes;
        }

        // Are we told to use early closing mode?
        if (batch.isPoll && dwr.engine._useStreamingPoll == "false") {
          batch.map.partialResponse = dwr.engine._partialResponseNo;
        }
        if (batch.isPoll && dwr.engine.util.ieCondition("if lte IE 9")) {
          batch.map.partialResponse = dwr.engine._partialResponseNo;
        }

        if (window.XMLHttpRequest) {
          batch.req = new XMLHttpRequest();
        }
        else if (window.ActiveXObject) {
          batch.req = dwr.engine.util.newActiveXObject(dwr.engine.transport.xhr.XMLHTTP);
        }

        // Proceed using XMLHttpRequest
        if (batch.async === true) {
          batch.req.onreadystatechange = function() {
            if (typeof dwr != 'undefined') {
              dwr.engine.transport.xhr.stateChange(batch);
            }
          };
        }

        httpMethod = dwr.engine.transport.xhr.httpMethod;

        batch.mode = batch.isPoll ? dwr.engine._ModePlainPoll : dwr.engine._ModePlainCall;
        var request = dwr.engine.batch.constructRequest(batch, httpMethod);

        try {
          batch.req.open(httpMethod, request.url, batch.async);
          try {
            for (var prop in batch.headers) {
              var value = batch.headers[prop];
              if (typeof value == "string") {
                batch.req.setRequestHeader(prop, value);
              }
            }
            if (!batch.headers["Content-Type"]) {
              batch.req.setRequestHeader("Content-Type", "text/plain");
            }
          }
          catch (ex) {
            dwr.engine._handleWarning(batch, ex);
          }

          batch.req.send(request.body);
          if (batch.async === false) {
            dwr.engine.transport.xhr.stateChange(batch);
          }
        }
        catch (ex2) {
          dwr.engine._handleError(batch, ex2);
        }

        if (batch.isPoll && batch.map.partialResponse == dwr.engine._partialResponseYes) {
          dwr.engine.transport.xhr.checkCometPoll();
        }

        // This is only of any use in sync mode to return the reply data
        return batch.reply;
      },

      /**
       * Called by XMLHttpRequest to indicate that something has happened
       * @private
       * @param {Object} batch The current remote operation
       */
      stateChange:function(batch) {
        var toEval;

        if (batch.aborted) return;
        if (batch.completed) {
          if (batch.transport) dwr.engine._debug("Error: _stateChange() with batch.completed");
          return;
        }

        // Try to get the response HTTP status if applicable
        var req = batch.req;
        var status = 0;
        try {
          if (req.readyState >= 2) {
            status = req.status; // causes Mozilla to except on page moves
          }
        }
        catch(ignore) {}

        // If we couldn't get the status we bail out, unless the request is
        // complete, which means error (handled further below)
        if (status === 0 && req.readyState < 4) {
          return;
        }

        // If the status is 200, we are now online.
        // Future improvement per Mike W. - A solution where we only use the callbacks/handlers of the poll call to trigger
        // the retry handling would be ideal.  We would need something like a new internal callback that reports
        // progress back to the caller, and the design should be compatible with getting it to work with iframes as well.
        if (status === 200) {
          dwr.engine._handlePollStatusChange(true, null, batch);
        }

        // The rest of this function only deals with request completion
        if (req.readyState != 4) {
          return;
        }

        if (dwr.engine._unloading) {
          dwr.engine._debug("Ignoring reply from server as page is unloading.");
          return;
        }

        try {
          var reply = req.responseText;
          reply = dwr.engine._replyRewriteHandler(reply);
          var contentType = req.getResponseHeader("Content-Type");
          if (status >= 200 && status < 300) {
            if (contentType.indexOf("text/plain") < 0 && contentType.indexOf("text/javascript") < 0) {
              if (contentType.indexOf("text/html") == 0) {
                dwr.engine._handleError(batch, { name:"dwr.engine.textHtmlReply", message:"HTML reply from the server.", responseText:reply||"" });
              } else {
                dwr.engine._handleError(batch, { name:"dwr.engine.invalidMimeType", message:"Invalid content type: '" + contentType + "'" });
              }
            } else if (reply == null || reply === "") {
              dwr.engine._handleError(batch, { name:"dwr.engine.missingData", message:"No data received from server" });
            } else {
              if (batch.isPoll && batch.map.partialResponse == dwr.engine._partialResponseYes) {
                dwr.engine.transport.xhr.processCometResponse(reply, batch);
              } else {
                if (reply.search("//#DWR") === -1) {
                  dwr.engine._handleError(batch, { name:"dwr.engine.invalidReply", message:"Invalid reply from server" });
                } else {
                  toEval = reply;
                }
              }
            }
          } else if (status >= 400) {
            var statusText = "statusText could not be read.";
            try {
              statusText = req.statusText;
            } catch (ex) {
             // Eat this, if the server just went down an exception can occur reading statusText.
            }
            dwr.engine._handleError(batch, { name:"dwr.engine.http." + status, message:statusText });
          }
        } catch (ex2) {
          dwr.engine._handleError(batch, ex2);
        }

        // Outside of the try/catch so errors propagate normally:
        if (toEval != null) toEval = toEval.replace(dwr.engine._scriptTagProtection, "");
        dwr.engine._executeScript(toEval);
        dwr.engine.transport.complete(batch);
      },

      /**
       * Check for reverse Ajax activity
       * @private
       */
      checkCometPoll:function() {
        var req = dwr.engine._pollBatch && dwr.engine._pollBatch.req;
        if (req) {
          var text = req.responseText;
          if (text != null) {
            dwr.engine.transport.xhr.processCometResponse(text, dwr.engine._pollBatch);
          }
        }
        // If the poll resources are still there, come back again
        if (dwr.engine._pollBatch) {
          setTimeout(dwr.engine.transport.xhr.checkCometPoll, dwr.engine._pollCometInterval);
        }
      },

      /**
       * Some more text might have come in, test and execute the new stuff.
       * This method could also be called by the iframe transport
       * @private
       * @param {Object} response from xhr.responseText
       * @param {Object} batch The batch that the XHR object pertains to
       */
      processCometResponse:function(response, batch) {
        if (batch.charsProcessed == response.length) return;
        if (response.length === 0) {
          batch.charsProcessed = 0;
          return;
        }

        var firstStartTag = response.indexOf("//#DWR-START#", batch.charsProcessed);
        if (firstStartTag == -1) {
          // dwr.engine._debug("No start tag (search from " + batch.charsProcessed + "). skipping '" + response.substring(batch.charsProcessed) + "'");
          return;
        }
        // if (firstStartTag > 0) {
        //   dwr.engine._debug("Start tag not at start (search from " + batch.charsProcessed + "). skipping '" + response.substring(batch.charsProcessed, firstStartTag) + "'");
        // }

        var lastEndTag = response.lastIndexOf("//#DWR-END#");
        if (lastEndTag == -1) {
          // dwr.engine._debug("No end tag. unchanged charsProcessed=" + batch.charsProcessed);
          return;
        }

        // Skip the end tag too for next time, remembering CR and LF
        if (response.charCodeAt(lastEndTag + 11) == 13 && response.charCodeAt(lastEndTag + 12) == 10) {
          batch.charsProcessed = lastEndTag + 13;
        }
        else {
          batch.charsProcessed = lastEndTag + 11;
        }

        var exec = response.substring(firstStartTag + 13, lastEndTag);

        try {
          dwr.engine._executeScript(exec);
        }
        catch (ex) {
          // This is one of these annoying points where we might be executing
          // while the window is being destroyed. If dwr == null, bail out.
          if (dwr != null) {
            dwr.engine._handleError(batch, ex);
          }
        }
      },

      /**
       * Aborts ongoing request (for timeouts etc)
       */
      abort:function(batch) {
        if (batch.req) {
          batch.aborted = true;
          batch.req.abort();
        }
      },

      /**
       * Tidy-up when an XHR call is done
       * @param {Object} batch
       */
      remove:function(batch) {
        // XHR tidyup: avoid IE handles increase
        if (batch.req) {
          delete batch.req;
        }
      }
    },

    /**
     * Functions for remoting through IFrame
     */
    iframe:{
      /**
       * The default HTTP method to use
       */
      httpMethod:"POST",

      /**
       * Setup a batch for transfer through IFrame
       * @param {Object} batch The batch to alter for IFrame transmit
       */
      send:function(batch) {
        if (document.body == null) {
          setTimeout(function(){dwr.engine.transport.iframe.send(batch);}, 100);
          return;
        }
        batch.httpMethod = dwr.engine.transport.iframe.httpMethod;
        if (batch.fileUpload) {
          batch.httpMethod = "POST";
          batch.encType = "multipart/form-data";
        }
        batch.loadingStarted = false;
        if (window.location.hostname != document.domain) batch.map.documentDomain = document.domain;
        var idname = dwr.engine.transport.iframe.getId(batch);
        batch.div1 = document.createElement("div");
        batch.div1.innerHTML = "<iframe frameborder='0' style='width:0px;height:0px;border:0;display:none;' id='" + idname + "' name='" + idname + "'></iframe>";
        batch.iframe = batch.div1.firstChild;
        batch.document = document;
        batch.iframe.batch = batch;
        batch.fileInputs = [];
        dwr.engine.util.addEventListener(batch.iframe, "load", function(ev) {
          // Bail out if this is a premature load event (IE) 
          if (!batch.loadingStarted) return;
          // Put back file inputs
          while(batch.fileInputs.length > 0) {
            var entry = batch.fileInputs.pop();
            entry.original.setAttribute("id", entry.clone.getAttribute("id"));
            entry.original.setAttribute("name", entry.clone.getAttribute("name"));
            entry.original.style.display = entry.clone.style.display;
            entry.clone.parentNode.replaceChild(entry.original, entry.clone);
          }
          // Bail out if the batch was completed the normal way 
          if (batch.completed) return;
          // Check for a queued batch exception
          if (dwr.engine._queuedBatchException) {
            dwr.engine._handleError(batch, dwr.engine._queuedBatchException);
            dwr.engine._queuedBatchException = null;
            return;
          }
          // The batch hasn't been completed the normal way, trigger a textHtmlReply error
          try {
            var contentDoc = batch.iframe.contentDocument || batch.iframe.contentWindow.document;
          } catch(ex) {
            var contentEx = ex; // may be caused by a HTML error page reply when document.domain is used
          }
          if (typeof dwr != "undefined") {
            var htmlResponse = contentDoc && contentDoc.documentElement ? contentDoc.documentElement.outerHTML : "(Could not extract HTML response: " + contentEx.message + ")";
            dwr.engine._handleError(batch, {name:"dwr.engine.textHtmlReply", message:"HTML reply from the server.", responseText:htmlResponse});
          }
        });
        // This needs to be after the event listener is added, for IE.
        // http://stackoverflow.com/questions/18414964/load-event-for-iframe-does-not-fire-in-ie
        document.body.appendChild(batch.div1);
        dwr.engine.transport.iframe.beginLoader(batch, idname);
      },

      /**
       * Create a unique ID so multiple iframes can fire at the same time
       * @param {Object} batch A source of a unique number for the batch
       * @return {String} a name prefix for created elements
       */
      getId:function(batch) {
        return batch.isPoll ? "dwr-if-poll-" + dwr.engine._instanceId + "-" + batch.map.batchId : "dwr-if-" + dwr.engine._instanceId + "-" + batch.map.batchId;
      },

      /**
       * Setup a form or construct a src attribute to use the iframe.
       * @param {Object} batch
       */
      beginLoader:function(batch, idname) {
        if (batch.isPoll) {
          batch.map.partialResponse = dwr.engine._partialResponseYes;
        }
        batch.mode = batch.isPoll ? dwr.engine._ModeHtmlPoll : dwr.engine._ModeHtmlCall;
        var request = dwr.engine.batch.constructRequest(batch, batch.httpMethod);
        if (batch.httpMethod === "GET") {
          batch.iframe.setAttribute("src", request.url);
        }
        else {
          // TODO: On firefox we can now get the values of file fields, maybe we should use this
          // See http://soakedandsoaped.com/articles/read/firefox-3-native-ajax-file-upload
          // setting enctype via the DOM does not work in IE, create the form using innerHTML instead
          batch.div2 = document.createElement("div");
          document.body.appendChild(batch.div2);
          batch.div2.innerHTML = "<form" + (batch.encType ? " encType='" + batch.encType + "' encoding='" + batch.encType + "'" : "") + "></form>";
          batch.form = batch.div2.firstChild;
          batch.form.setAttribute("action", request.url);
          batch.form.setAttribute("target", idname);
          batch.form.setAttribute("style", "display:none");
          batch.form.setAttribute("method", batch.httpMethod);
          for (var prop in batch.map) {
            var value = batch.map[prop];
            if (typeof value != "function") {
              if (value && value.tagName && value.tagName.toLowerCase() == "input" && value.type && value.type.toLowerCase() == "file") {
                // Since we can not set the value of a file object, we must post the actual file object
                // that the user clicked browse on. We will put a clone in it's place that we will restore later.
                // (note that the clone doesn't retain the selected file in most browsers)
                if (value.parentNode) {
                  var clone = value.cloneNode(true);
                  value.parentNode.replaceChild(clone, value);
                  batch.fileInputs.push({original:value, clone:clone});
                }
                value.removeAttribute("id");
                value.setAttribute("name", prop);
                value.style.display = "none";
                batch.form.appendChild(value);
              } else {
                var formInput = batch.document.createElement("input");
                formInput.setAttribute("type", "hidden");
                formInput.setAttribute("name", prop);
                formInput.setAttribute("value", value);
                batch.form.appendChild(formInput);
              }
            }
          }
          batch.loadingStarted = true;
          batch.form.submit();
        }
      },

      /**
       * Functions designed to be called by the server
       */
      remote:{
        /**
         * Called by the server: An IFrame reply is about to start
         * @private
         * @param {Object} iframe
         * @param {int} batchId
         */
        beginIFrameResponse:function(iframe, batchId) {
        },
        
        /**
         * Called by the server: An IFrame script tag has completed
         * @private
         * @param {Object} iframe
         */
        endChunk:function(iframeWindow) {
          setTimeout(function() {
            // Delete the first script tag in the iframe
            var scriptTags = iframeWindow.document.body.getElementsByTagName("script");
            if (scriptTags.length > 0) {
              var s = scriptTags[0];
              s.parentNode.removeChild(s);
            }
          }, 0);
        },

        /**
         * Called by the server: An IFrame reply is just completing
         * @private
         * @param {int} batchId
         */
        endIFrameResponse:function(batchId) {
          var batch = dwr.engine._batches[batchId];
          if (batch) dwr.engine.transport.complete(batch);
        }
      },

      remove:function(batch) {
        // Safari 3 and Chrome 1 will show endless loading spinner if removing
        // iframe during execution of iframe script, so we delay it a bit
        setTimeout(function(){
          if (batch.iframe && batch.iframe.parentNode) {
            batch.iframe.parentNode.removeChild(batch.iframe);
            batch.iframe = null;
          }
          if (batch.div1 && batch.div1.parentNode) {
            batch.div1.parentNode.removeChild(batch.div1);
            batch.div1 = null;
          }
          if (batch.form && batch.form.parentNode) {
            batch.form.parentNode.removeChild(batch.form);
            batch.form = null;
          }
          if (batch.div2 && batch.div2.parentNode) {
            batch.div2.parentNode.removeChild(batch.div2);
            batch.div2 = null;
          }
        }, 100);
      }
    },

    /**
     * Functions for remoting through Script Tags
     */
    scriptTag:{
      /**
       * Setup a batch for transfer through a script tag
       * @param {Object} batch The batch to alter for script tag transmit
       */
      send:function(batch) {
        if (batch.isPoll) {
          batch.map.partialResponse = dwr.engine._partialResponseNo;
        }
        batch.mode = batch.isPoll ? dwr.engine._ModePlainPoll : dwr.engine._ModePlainCall;
        var request = dwr.engine.batch.constructRequest(batch, "GET");
        // The best option is DOM manipulation
        batch.script = document.createElement("script");
        batch.script.id = "dwr-st-" + batch.map.batchId;
        batch.script.src = request.url;
        batch.script.type = "text/javascript";
        batch.script.async = true;
        dwr.engine.util.addEventListener(batch.script, "load", function(ev) {
          if (typeof dwr != "undefined") dwr.engine.transport.scriptTag.complete(batch);
        });
        dwr.engine.util.addEventListener(batch.script, "error", function(ev) {
          if (typeof dwr != "undefined") dwr.engine.transport.scriptTag.complete(batch);
        });
        dwr.engine.util.addEventListener(batch.script, "readystatechange", function(ev) {
          if (typeof dwr != "undefined") {
            if (batch.completed) return;
            if (batch.script.readyState == "complete" || batch.script.readyState == "loaded") {
              dwr.engine.transport.scriptTag.complete(batch);
            }
          }
        });
        document.getElementsByTagName("head")[0].appendChild(batch.script);
      },

      /**
       * Notified when the script tag has been loaded and executed
       */
      complete:function(batch) {
        dwr.engine.transport.complete(batch);
      },

      /**
       * Cleanup script tag
       */
      remove:function(batch) {
        // Bail out if we were already called
        if (!batch.script) return;

        // Cleanup script tag
        batch.script.parentNode.removeChild(batch.script);
        batch.script = null;
      }
    }
  };

  /**
   * Functions to manipulate batches
   * @private
   */
  dwr.engine.batch = {
    /**
     * Generate a new standard batch
     * @private
     */
    create:function() {
      var batch = {
        async:dwr.engine._async,
        charsProcessed:0,
        handlers:[],
        isPoll:false,
        map:{ callCount:0 },
        paramCount:0,
        preHooks:[],
        postHooks:[],
        timeout:dwr.engine._timeout,
        errorHandler:null,
        globalErrorHandler:dwr.engine._errorHandler,
        warningHandler:dwr.engine._warningHandler,
        textHtmlHandler:null,
        globalTextHtmlHandler:dwr.engine._textHtmlHandler
      };
      if (!dwr.engine._activeReverseAjax) batch.map.nextReverseAjaxIndex = dwr.engine._nextReverseAjaxIndex;
      
      if (dwr.engine._preHook) {
        batch.preHooks.push(dwr.engine._preHook);
      }
      if (dwr.engine._postHook) {
        batch.postHooks.push(dwr.engine._postHook);
      }

      dwr.engine.batch.populateHeadersAndAttributes(batch);
      return batch;
    },

    /**
     * Generate a new batch for polling
     * @private
     * @see dwr.engine.batch.create()
     */
    createPoll:function() {
      var batch = {
        async:true,
        charsProcessed:0,
        handlers:[{
          callback:function(pause) {
            dwr.engine._pollBatch = null;
            setTimeout(dwr.engine._poll, pause);
          }
        }],
        isPoll:true,
        map:{ callCount:1, nextReverseAjaxIndex:dwr.engine._nextReverseAjaxIndex},
        paramCount:0,
        preHooks:[],
        postHooks:[],
        timeout:dwr.engine._pollTimeout
      };
      dwr.engine.batch.populateHeadersAndAttributes(batch);
      return batch;
    },

    /**
     * Copy the global headers and parameters into this batch object
     * @private
     * @param {Object} batch The destination
     */
    populateHeadersAndAttributes:function(batch) {
      var propname, data;
      batch.headers = {};
      if (dwr.engine._headers) {
        for (propname in dwr.engine._headers) {
          data = dwr.engine._headers[propname];
          if (typeof data != "function") batch.headers[propname] = data;
        }
      }
      batch.attributes = {}; // props to add as request attributes
      if (dwr.engine._attributes) {
        for (propname in dwr.engine._attributes) {
          data = dwr.engine._attributes[propname];
          if (typeof data != "function") batch.attributes[propname] = data;
        }
      }
    },

    /**
     * Augment this batch with a new call
     * @private
     */
    addCall:function(batch, scriptName, methodName, args) {
      // From the other params, work out which is the function (or object with
      // call meta-data) and which is the call parameters
      var callData, stopAt;
      var lastArg = args[args.length - 1];
      if (lastArg == null || typeof lastArg == "function") {
        callData = { callback:lastArg };
        stopAt = args.length - 1;
      }
      else if (dwr.engine.util.isCallOptionArgument(lastArg)) {
        callData = lastArg;
        stopAt = args.length - 1;
      }
      else {
        callData = {};
        stopAt = args.length;
      }

      // Merge from the callData into the batch
      if (dwr.engine._singleShot) dwr.engine.batch.merge(batch, callData);
      batch.handlers[batch.map.callCount] = {
        callback:callData.callbackHandler || callData.callback,
        callbackArg:callData.callbackArg || callData.arg,
        callbackScope:callData.callbackScope || callData.scope || window,
        exceptionHandler:callData.exceptionHandler,
        exceptionArg:callData.exceptionArg || callData.arg,
        exceptionScope:callData.exceptionScope || callData.scope || window,
        errorHandler:callData.errorHandler
      };

      // Copy to the map the things that need serializing
      var prefix = "c" + batch.map.callCount + "-";
      batch.map[prefix + "scriptName"] = scriptName;
      batch.map[prefix + "methodName"] = methodName;
      batch.map[prefix + "id"] = batch.map.callCount;
      var directrefmap = {}, otherrefmap = {};
      for (var i = 0; i < stopAt; i++) {
        dwr.engine.serialize.convert(batch, directrefmap, otherrefmap, args[i], prefix + "param" + i, 0);
      }
      dwr.engine.serialize.cleanup(directrefmap);
    },

    /**
     * Take further options and merge them into a batch
     * @private
     * @param {Object} batch The batch that we are altering
     * @param {Object} overrides The object containing properties to copy into batch
     */
    merge:function(batch, overrides) {
      var propname, data;
      for (var i = 0; i < dwr.engine._propnames.length; i++) {
        propname = dwr.engine._propnames[i];
        if (dwr.engine._singleShot && propname == "errorHandler") continue;
        if (overrides[propname] != null) batch[propname] = overrides[propname];
      }
      if (overrides.preHook != null) batch.preHooks.unshift(overrides.preHook);
      if (overrides.postHook != null) batch.postHooks.push(overrides.postHook);
      if (overrides.headers) {
        for (propname in overrides.headers) {
          data = overrides.headers[propname];
          if (typeof data != "function") batch.headers[propname] = data;
        }
      }
      var attrs = null;
      if (overrides.attributes) attrs = overrides.attributes;
      if (attrs) {
        for (propname in attrs) {
          data = attrs[propname];
          if (typeof data != "function") batch.attributes[propname] = data;
        }
      }
    },

    /**
     * Executed just before a transport sends the batch
     * @private
     * @param {Object} batch The batch to prepare for sending
     */
    prepareToSend:function(batch) {
      batch.map.batchId = dwr.engine._nextBatchId;
      dwr.engine._nextBatchId++;
      dwr.engine._batches[batch.map.batchId] = batch;
      dwr.engine._batchesLength++;
      batch.completed = false;
      batch.map.instanceId = dwr.engine._instanceId;

      // security details are filled in late so previous batches have completed
      batch.map.page = encodeURIComponent(window.location.pathname + window.location.search);
      batch.map.scriptSessionId = dwr.engine._scriptSessionId;

      for (var i = 0; i < batch.preHooks.length; i++) {
        batch.preHooks[i]();
      }
      batch.preHooks = null;
      // Set a timeout
      if (batch.timeout && batch.timeout !== 0) {
        batch.timeoutId = setTimeout(function() { 
          dwr.engine.transport.abort(batch); 
          dwr.engine._handleError(batch, { name:"dwr.engine.timeout", message:"Timeout" });
        }, batch.timeout);
      }
    },

    /**
     * Work out what the URL should look like
     * @private
     * @param {Object} batch the data that we are sending
     * @param {Object} httpMethod Are we using GET/POST etc?
     */
    constructRequest:function(batch, httpMethod) {
      // A quick string to help people that use web log analysers
      var urlBuffer = [];
      urlBuffer.push(batch.path);
      urlBuffer.push(batch.mode);
      if (batch.isPoll) {
        urlBuffer.push("ReverseAjax.dwr");
      }
      else if (batch.map.callCount == 1) {
        urlBuffer.push(batch.map["c0-scriptName"]);
        urlBuffer.push(".");
        urlBuffer.push(batch.map["c0-methodName"]);
        urlBuffer.push(".dwr");
      }
      else {
        urlBuffer.push("Multiple.");
        urlBuffer.push(batch.map.callCount);
        urlBuffer.push(".dwr");
      }
      // Play nice with url re-writing
      var sessionMatchExpr = new RegExp(
        "^" +            // start of string
        "[^;\\?#]+" +    // protocol, host, and path (up to first of ; ? or #)
        "(;[^\\?#]+)");  // group 1: ; and sessionid (up to first of ? or #)
      var sessionMatch = location.href.match(sessionMatchExpr);
      if (sessionMatch != null) {
        urlBuffer.push(sessionMatch[1]);
      }

      // Add attributes to the output map
      if (batch.attributes) {
        for (var attrname in batch.attributes) {
          var data = batch.attributes[attrname];
          if (typeof data != "function") batch.map["a-" + attrname] = "" + data;
        }
      }

      var request = {};
      var prop;
      if (httpMethod == "GET") {
        // Some browsers (Opera/Safari2) seem to fail to convert the callCount value
        // to a string in the loop below so we do it manually here.
        batch.map.callCount = "" + batch.map.callCount;
        urlBuffer.push("?");
        for (prop in batch.map) {
          if (typeof batch.map[prop] != "function") {
            urlBuffer.push(encodeURIComponent(prop));
            urlBuffer.push("=");
            urlBuffer.push(encodeURIComponent(batch.map[prop]));
            urlBuffer.push("&");
          }
        }
        urlBuffer.pop(); // remove the trailing &
        request.body = null;
      }
      else {
        // PERFORMANCE: for iframe mode this is thrown away.
        request.body = "";
        if (dwr.engine.util.ieCondition("if lte IE 7")) {
          // Use array joining on IE1-7 (fastest)
          var buf = [];
          for (prop in batch.map) {
            if (typeof batch.map[prop] != "function") {
              buf.push(prop + "=" + batch.map[prop] + dwr.engine._postSeperator);
            }
          }
          request.body = buf.join("");
        }
        else {
          // Use string concat on other browsers (fastest)
          for (prop in batch.map) {
            if (typeof batch.map[prop] != "function") {
              request.body += prop + "=" + batch.map[prop] + dwr.engine._postSeperator;
            }
          }
        }
        request.body = dwr.engine._contentRewriteHandler(request.body);
      }
      request.url = dwr.engine._urlRewriteHandler(urlBuffer.join(""));
      return request;
    },

    /**
     * @private This function is invoked when a batch reply is received.
     * It checks that there is a response for every call in the batch. Otherwise,
     * an error will be signaled (a call without a response indicates that the
     * server failed to send complete batch response).
     */
    validate:function(batch) {
      if (!batch.completed) {
        var repliesReceived = 0;
        for (var i = 0; i < batch.map.callCount; i++) {
          if (batch.handlers[i].completed === true) {
            repliesReceived++;
          }
        }
        if (repliesReceived == 0 && dwr.engine._queuedBatchException) {
          dwr.engine._handleError(batch, dwr.engine._queuedBatchException);
          dwr.engine._queuedBatchException = null;
        } else if (repliesReceived < batch.map.callCount) {
          dwr.engine._handleError(batch, { name:"dwr.engine.incompleteReply", message:"Incomplete reply from server" });
        }
      }
    },

    /**
     * A call has finished by whatever means and we need to shut it all down.
     * @private
     * @param {Object} batch The batch that we are altering
     */
    remove:function(batch) {
      if (!batch) {
        dwr.engine._debug("Warning: null batch in dwr.engine.batch.remove()", true);
        return;
      }

      if (batch.completed) {
        return;
      }
      batch.completed = true;

      // Transport tidyup
      dwr.engine.transport.remove(batch);

      // Timeout tidyup
      if (batch.timeoutId != null) {
        clearTimeout(batch.timeoutId);
        delete batch.timeoutId;
      }

      // TODO: co-locate all the functions that work on a set of batches
      if (batch.map && (batch.map.batchId != null)) {
        delete dwr.engine._batches[batch.map.batchId];
        dwr.engine._batchesLength--;
      }
      if (batch == dwr.engine._batch) dwr.engine._batch = null;
      if (batch == dwr.engine._pollBatch) dwr.engine._pollBatch = null;

      // If there is anything on the queue waiting to go out, then send it.
      // We don't need to check for ordered mode, here because when ordered mode
      // gets turned off, we still process *waiting* batches in an ordered way.
      if (dwr.engine._batchQueue.length !== 0) {
        var sendbatch = dwr.engine._batchQueue.shift();
        dwr.engine.transport.send(sendbatch);
      }
    }
  };

  /**
   * Various utility functions
   * @private
   */
  dwr.engine.util = {
    /**
     * Create one of a number of ActiveX strings
     * @param {Object} axarray An array of strings to attempt to create ActiveX objects from
     */
    newActiveXObject:function(axarray) {
      var returnValue;
      for (var i = 0; i < axarray.length; i++) {
        try {
          returnValue = new ActiveXObject(axarray[i]);
          break;
        }
        catch (ex) { /* ignore */ }
      }
      return returnValue;
    },

    ieCondition:function(cond) {
      if (!(cond in dwr.engine._ieConditions)) {
        var div = document.createElement("div");
        div.innerHTML = "<!--[" + cond + "]><p><![endif]-->";
        dwr.engine._ieConditions[cond] = !!(div.getElementsByTagName("p").length);
      }
      return dwr.engine._ieConditions[cond];
    },
    
    /**
     * Transform a number into a token string suitable for ids
     */
    tokenify: function(number) {
      var tokenbuf = [];
      var charmap = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ*$";
      var remainder = number;
      while (remainder > 0)
      {
        tokenbuf.push(charmap.charAt(remainder & 0x3F));
        remainder = Math.floor(remainder / 64); // Can't use shift operator due to 32-bit limit in JS
      }
      return tokenbuf.join("");
    },

    addEventListener: function(elem, name, func) {
      if (elem.addEventListener)
        elem.addEventListener(name, func, false);
      else
        elem.attachEvent("on" + name, func);
    },

    isCallOptionArgument: function(lastArg) {
      return (typeof lastArg === "object" && (typeof lastArg.callback === "function" ||
        typeof lastArg.exceptionHandler === "function" || typeof lastArg.callbackHandler === "function" ||
        typeof lastArg.errorHandler === "function" || typeof lastArg.warningHandler === "function" || lastArg.hasOwnProperty("async")));
    },

    logHandlerEx: function(func) {
      try {
        func();
      } catch(ex) {
        dwr.engine._debug("Exception occured in user-specified handler:");
        dwr.engine._debug(ex);
      }
    }
  };

  // Initialize DWR.
  dwr.engine._initializer.init();

  /**
   * Routines for the DWR pubsub hub
   */
  dwr.hub = {
    /**
     * Publish some data to a given topic
     * @param {Object} topicName The topic to publish to
     * @param {Object} data The data to publish
     */
    publish:function(topicName, data) {
      dwr.engine._execute(null, '__System', 'publish', topicName, data, {});
    },

    /**
     * Subscribe to get notifications of publish events to a given topic
     * @param {String} topicName The topic to subscribe to
     * @param {Function} callback The function to call when a publish happens
     * @param {Object} scope The 'this' object on which the callback executes (optional)
     * @param {Object} subscriberData Data that the subscriber wishes to remember (optional)
     * @return An opaque type for use with unsubscribe
     */
    subscribe:function(topicName, callback, scope, subscriberData) {
      var subscription = "" + dwr.hub._subscriptionId;
      dwr.hub._subscriptionId++;
      dwr.hub._subscriptions[subscription] = {
        callback:callback,
        scope:scope,
        subscriberData:subscriberData
      };
      dwr.engine._execute(null, '__System', 'subscribe', topicName, subscription, {});
      return subscription;
    },

    /**
     * Called by the server: A publish event has happened that we care about
     * @private
     * @param {Object} subscriptionId
     * @param {Object} publishData
     */
    _remotePublish:function(subscriptionId, publishData) {
      var subscriptionData = dwr.hub._subscriptions[subscriptionId];
      if (!subscriptionData) return;
      subscriptionData.callback.call(subscriptionData.scope, publishData, subscriptionData.subscriberData);
    },

    /**
     * Each time we subscribe to something, we use a unique number
     */
    _subscriptionId:0,

    /**
     * We need to remember what we are subscribed to so we can recall the callback
     */
    _subscriptions:{}
  };

/**
 * High level data-sync API for use by Widget libraries like a Dojo-Data-Store.
 * For full documentation see org.directwebremoting.export.Data
 */
dwr.data = {

  /**
   * This is just documentation that defines how the listener parameter must act
   * in order to receive asynchronous updates
   */
  StoreChangeListener:{
    /**
     * Something has removed an item from the store
     * @param {StoreProvider} source The store from which it was moved
     * @param {string} itemId The ID of the item
     */
    itemRemoved:function(source, itemId) { },

    /**
     * Something has added an item to the store
     * @param {StoreProvider} source The store from which it was moved
     * @param {Item} item The thing that has changed
     */
    itemAdded:function(source, item) { },

    /**
     * Something has updated an item in the store
     * @param {StoreProvider} source The store from which it was moved
     * @param {Item} item The thing that has changed
     * @param {string[]} changedAttributes A list of changed attributes. If null then
     * you should assume that everything has changed
     */
    itemChanged:function(source, item, changedAttributes) { }
  },

  /**
   * Create a cache object containing the functions to interact with a server
   * side StoreProvider
   * @param {string} storeId ID of server provided storage
   * @param {dwr.data.StoreChangeListener} listener See server documentation
   * This is likely to be true if dwr.engine.activeReverseAjax == true
   */
  Cache:function(storeId, listener) {
    this.storeId = storeId;
    this.listener = listener;
  }
};

  /**
   * Notes that there is a region of a page that wishes to subscribe to server
   * side data and registers a callback function to receive the data.
   * @param {Object} region filtering and sorting options. Includes:
   * - start: The beginning of the region of specific interest
   * - count: The number of items being viewed
   * - sort: The sort criteria
   * - query: The filter criteria
   * @param {function|object} callbackObj A standard DWR callback object
   * @return
   */
  dwr.data.Cache.prototype.viewRegion = function(region, callbackObj) {
    if (!region) region = { };
    if (!region.start) region.start = 0;
    if (!region.count) region.count = -1;
    if (!region.sort) region.sort = [];
    else {
      for (var index = 0; index < region.sort.length; index++) {
        if (typeof region.sort[index].descending == "undefined") {
          region.sort[index].descending = false;
        }
      }
    }
    if (!region.query) region.query = {};

    return dwr.engine._execute(null, '__Data', 'viewRegion', [ this.storeId, region, this.listener, callbackObj ]);
  };

  /**
   * As dwr.data.Cache.viewRegion() except that we only want to see a single item.
   * @param {string} itemId ID of object within the given store
   * @param {function|object} callbackObj A standard DWR callback object
   */
  dwr.data.Cache.prototype.viewItem = function(itemId, callbackObj) {
    return dwr.engine._execute(null, '__Data', 'viewItem', [ this.storeId, itemId, this.listener, callbackObj ]);
  };

  /**
   * Undo the action of dwr.data.view()
   * @param {function|object} callbackObj A standard DWR callback object
   */
  dwr.data.Cache.prototype.unsubscribe = function(callbackObj) {
    if (this.listener) {
      return dwr.engine._execute(null, '__Data', 'unsubscribe', [ this.storeId, this.listener, callbackObj ]);
    }
  };

  /**
   * Request an update to server side data
   * @param {Object} items An array of update descriptions
   * @param {function|object} callbackObj A standard DWR callback object
   */
  dwr.data.Cache.prototype.update = function(items, callbackObj) {
    return dwr.engine._execute(null, '__Data', 'update', [ this.storeId, items, callbackObj ]);
  };

})();




if (typeof dwr == 'undefined' || dwr.engine == undefined) throw new Error('You must include DWR engine before including this file');

(function() {
  if (dwr.engine._getObject("message") == undefined) {
    var p;
    
    p = {};

    /**
     * @param {function|Object} callback callback function or options object
     */
    p.message = function(callback) {
      return dwr.engine._execute(p._path, 'message', 'message', arguments);
    };
    
    dwr.engine._setObject("message", p);
  }
})();



/*
 * Copyright 2005 Joe Walker
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Declare an object to which we can add real functions.
 */
if (typeof dwr == 'undefined') dwr = {};
if (!dwr.util) dwr.util = {};

/** @private The flag we use to decide if we should escape html */
dwr.util._escapeHtml = true;

/**
 * Set the global escapeHtml flag
 */
dwr.util.setEscapeHtml = function(escapeHtml) {
  dwr.util._escapeHtml = escapeHtml;
};

/** @private Work out from an options list and global settings if we should be esccaping */
dwr.util._shouldEscapeHtml = function(options) {
  if (options && options.escapeHtml != null) {
    return options.escapeHtml;
  }
  return dwr.util._escapeHtml;
};

/**
 * Return a string with &, < and > replaced with their entities
 * @see TODO
 */
dwr.util.escapeHtml = function(original) {
  return original.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
};

/**
 * Replace common XML entities with characters (see dwr.util.escapeHtml())
 * @see TODO
 */
dwr.util.unescapeHtml = function(original) {
  return original.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#039;/g,"'").replace(/&amp;/g,'&');
};

/**
 * Replace characters dangerous for XSS reasons with visually similar characters
 * @see TODO
 */
dwr.util.replaceXmlCharacters = function(original) {
  original = original.replace("&", "+");
  original = original.replace("<", "\u2039");
  original = original.replace(">", "\u203A");
  original = original.replace("\'", "\u2018");
  original = original.replace("\"", "\u201C");
  return original;
};

/**
 * Return true iff the input string contains any XSS dangerous characters
 * @see TODO
 */
dwr.util.containsXssRiskyCharacters = function(original) {
  return (original.indexOf('&') != -1
    || original.indexOf('<') != -1
    || original.indexOf('>') != -1
    || original.indexOf('\'') != -1
    || original.indexOf('\"') != -1);
};

/**
 * Enables you to react to return being pressed in an input
 */
dwr.util.onReturn = function(event, action) {
  if (!event) event = window.event;
  if (event && event.keyCode && event.keyCode == 13) action();
};

/**
 * Select a specific range in a text box. Useful for 'google suggest' type functions.
 */
dwr.util.selectRange = function(ele, start, end) {
  ele = dwr.util._getElementById(ele, "selectRange()");
  if (ele == null) return;
  if (ele.setSelectionRange) {
    ele.setSelectionRange(start, end);
  }
  else if (ele.createTextRange) {
    var range = ele.createTextRange();
    range.moveStart("character", start);
    range.moveEnd("character", end - ele.value.length);
    range.select();
  }
  ele.focus();
};

/**
 * Find the element in the current HTML document with the given id or ids
 */
dwr.util.byId = function() {
  var elems = [];
  for (var i = 0; i < arguments.length; i++) {
    var idOrElem = arguments[i];
    var elem;
    if (typeof idOrElem == 'string') {
      var elem = document.getElementById(idOrElem);
      // Workaround for IE and Opera that may return element based on name
      if (document.all && elem && dwr.util._getId(elem) != idOrElem) {
        elem = null;
        var maybeElems = document.all[idOrElem];
        if (maybeElems.tagName) maybeElems = [maybeElems];
        for (var j = 0; j < maybeElems.length; j++) {
          if (dwr.util._getId(maybeElems[j]) == idOrElem) {
            elem = maybeElems[j];
            break;
          }
        }
      }
    }
    else {
      elem = idOrElem;
    }
    if (arguments.length == 1) {
      return elem;
    }
    elems.push(elem);
  }
  return elems;
}

dwr.util._getId = function(elem) {
  // Get the element's real id. In some situations IE may (wrongly)
  // return another element from the getAttribute() call so we watch out for 
  // this case and use the attributes.id value instead. Note that the use of 
  // the attributes collection may cause problems in IE7 together with 
  // cloneNode so we avoid hitting it when possible.  
  var elemId = elem.getAttribute("id");
  if (dwr.util._isObject(elemId)) {
    elemId = elem.attributes.id.value;
  }
  return elemId;
};

/**
 * Alias $ to dwr.util.byId
 */
if (typeof $ == 'undefined') {
  $ = dwr.util.byId;
}

/**
 * This function pretty-prints simple data or whole object graphs, f ex as an aid in debugging.
 */
dwr.util.toDescriptiveString = function(data, showLevels, options) {
  if (showLevels === undefined) showLevels = 1;
  var opt = {};
  if (dwr.util._isObject(options)) opt = options;
  var defaultoptions = {
    escapeHtml:false,
    baseIndent: "",
    childIndent: "\u00A0\u00A0",
    lineTerminator: "\n",
    oneLineMaxItems: 5,
    shortStringMaxLength: 13,
    propertyNameMaxLength: 30 
  };
  for (var p in defaultoptions) {
    if (!(p in opt)) {
      opt[p] = defaultoptions[p];
    }
  }

  var skipDomProperties = {
    document:true, ownerDocument:true,
    all:true,
    parentElement:true, parentNode:true, offsetParent:true,
    children:true, firstChild:true, lastChild:true,
    previousSibling:true, nextSibling:true,
    innerHTML:true, outerHTML:true,
    innerText:true, outerText:true, textContent:true,
    attributes:true,
    style:true, currentStyle:true, runtimeStyle:true,
    parentTextEdit:true
  };
  
  function recursive(data, showLevels, indentDepth, options) {
    var reply = "";
    try {
      // string
      if (dwr.util._isString(data)) {
        var str = data;
        if (showLevels == 0 && str.length > options.shortStringMaxLength)
          str = str.substring(0, options.shortStringMaxLength-3) + "...";
        if (options.escapeHtml) {
          // Do the escape separately for every line as escapeHtml() on some 
          // browsers (IE) will strip line breaks and we want to preserve them
          var lines = str.split("\n");
          for (var i = 0; i < lines.length; i++) lines[i] = dwr.util.escapeHtml(lines[i]);
          str = lines.join("\n");
        }
        if (showLevels == 0) { // Short format
          str = str.replace(/\n|\r|\t/g, function(ch) {
            switch (ch) {
              case "\n": return "\\n";
              case "\r": return "";
              case "\t": return "\\t";
            }
          });
        }
        else { // Long format
          str = str.replace(/\n|\r|\t/g, function(ch) {
            switch (ch) {
              case "\n": return options.lineTerminator + indent(indentDepth+1, options);
              case "\r": return "";
              case "\t": return "\\t";
            }
          });
        }
        reply = '"' + str + '"';
      }
      
      // function
      else if (dwr.util._isFunction(data)) {
        reply = "function";
      }
    
      // Array
      else if (dwr.util._isArrayLike(data)) {
        if (showLevels == 0) { // Short format (don't show items)
          if (data.length > 0)
            reply = "[...]";
          else
            reply = "[]";
        }
        else { // Long format (show items)
          var strarr = [];
          strarr.push("[");
          var count = 0;
          for (var i = 0; i < data.length; i++) {
            if (!(i in data) && data != "[object NodeList]") continue;
            var itemvalue = data[i];
            if (count > 0) strarr.push(", ");
            if (showLevels == 1) { // One-line format
              if (count == options.oneLineMaxItems) {
                strarr.push("...");
                break;
              }
            }
            else { // Multi-line format
              strarr.push(options.lineTerminator + indent(indentDepth+1, options));
            }
            if (i != count) {
              strarr.push(i);
              strarr.push(":");
            }
            strarr.push(recursive(itemvalue, showLevels-1, indentDepth+1, options));
            count++;
          }
          if (showLevels > 1) strarr.push(options.lineTerminator + indent(indentDepth, options));
          strarr.push("]");
          reply = strarr.join("");
        }
      }
      
      // Objects except Date
      else if (dwr.util._isObject(data) && !dwr.util._isDate(data)) {
        if (showLevels == 0) { // Short format (don't show properties)
          reply = dwr.util._detailedTypeOf(data);
        }
        else { // Long format (show properties)
          var strarr = [];
          if (dwr.util._detailedTypeOf(data) != "Object") {
            strarr.push(dwr.util._detailedTypeOf(data));
            if (typeof data.valueOf() != "object") {
              strarr.push(":");
              strarr.push(recursive(data.valueOf(), 1, indentDepth, options));
            }
            strarr.push(" ");
          }
          strarr.push("{");
          var isDomObject = dwr.util._isHTMLElement(data); 
          var count = 0;
          for (var prop in data) {
            var propvalue = data[prop];
            if (isDomObject) {
              if (propvalue == null) continue;
              if (typeof propvalue == "function") continue;
              if (skipDomProperties[prop]) continue;
              if (prop.toUpperCase() == prop) continue;
            }
            if (count > 0) strarr.push(", ");
            if (showLevels == 1) { // One-line format
              if (count == options.oneLineMaxItems) {
                strarr.push("...");
                break;
              }
            }
            else { // Multi-line format
              strarr.push(options.lineTerminator + indent(indentDepth+1, options));
            }
            strarr.push(prop.length > options.propertyNameMaxLength ? prop.substring(0, options.propertyNameMaxLength-3) + "..." : prop);
            strarr.push(":");
            strarr.push(recursive(propvalue, showLevels-1, indentDepth+1, options));
            count++;
          }
          if (showLevels > 1 && count > 0) strarr.push(options.lineTerminator + indent(indentDepth, options));
          strarr.push("}");
          reply = strarr.join("");
        }
      }
  
      // undefined, null, number, boolean, Date
      else {
        reply = "" + data;
      }
  
      return reply;
    }
    catch(err) {
      return (err.message ? err.message : ""+err);
    }
  }

  function indent(count, options) {
    var strarr = [];
    strarr.push(options.baseIndent);
    for (var i=0; i<count; i++) {
      strarr.push(options.childIndent);
    }
    return strarr.join("");
  };
  
  return recursive(data, showLevels, 0, opt);
};

/**
 * Setup a GMail style loading message.
 */
dwr.util.useLoadingMessage = function(message) {
  var loadingMessage;
  if (message) loadingMessage = message;
  else loadingMessage = "Loading";
  dwr.engine.setPreHook(function() {
    var disabledZone = dwr.util.byId('disabledZone');
    if (!disabledZone) {
      disabledZone = document.createElement('div');
      disabledZone.setAttribute('id', 'disabledZone');
      disabledZone.style.position = "absolute";
      disabledZone.style.zIndex = "1000";
      disabledZone.style.left = "0px";
      disabledZone.style.top = "0px";
      disabledZone.style.width = "100%";
      disabledZone.style.height = "100%";
      // IE need a background color to block click. Use an invisible background.
      if (window.ActiveXObject) {
        disabledZone.style.background = "white";
        disabledZone.style.filter = "alpha(opacity=0)";
      }
      document.body.appendChild(disabledZone);
      var messageZone = document.createElement('div');
      messageZone.setAttribute('id', 'messageZone');
      messageZone.style.position = "absolute";
      messageZone.style.top = "0px";
      messageZone.style.right = "0px";
      messageZone.style.background = "red";
      messageZone.style.color = "white";
      messageZone.style.fontFamily = "Arial,Helvetica,sans-serif";
      messageZone.style.padding = "4px";
      document.body.appendChild(messageZone);
      var text = document.createTextNode(loadingMessage);
      messageZone.appendChild(text);
      dwr.util._disabledZoneUseCount = 1;
    }
    else {
      dwr.util.byId('messageZone').innerHTML = loadingMessage;
      disabledZone.style.visibility = 'visible';
      dwr.util._disabledZoneUseCount++;
      dwr.util.byId('messageZone').style.visibility = 'visible';
    }
  });
  dwr.engine.setPostHook(function() {
    dwr.util._disabledZoneUseCount--;
    if (dwr.util._disabledZoneUseCount == 0) {
      dwr.util.byId('disabledZone').style.visibility = 'hidden';
      dwr.util.byId('messageZone').style.visibility = 'hidden';
    }
  });
};

/**
 * Set a global highlight handler
 */
dwr.util.setHighlightHandler = function(handler) {
  dwr.util._highlightHandler = handler;
};

/**
 * An example highlight handler
 */
dwr.util.yellowFadeHighlightHandler = function(ele) {
  dwr.util._yellowFadeProcess(ele, 0);
};
dwr.util._yellowFadeSteps = [ "d0", "b0", "a0", "90", "98", "a0", "a8", "b0", "b8", "c0", "c8", "d0", "d8", "e0", "e8", "f0", "f8" ];
dwr.util._yellowFadeProcess = function(ele, colorIndex) {
  ele = dwr.util.byId(ele);
  if (colorIndex < dwr.util._yellowFadeSteps.length) {
    ele.style.backgroundColor = "#ffff" + dwr.util._yellowFadeSteps[colorIndex];
    setTimeout("dwr.util._yellowFadeProcess('" + dwr.util._getId(ele) + "'," + (colorIndex + 1) + ")", 200);
  }
  else {
    ele.style.backgroundColor = "transparent";
  }
};

/**
 * An example highlight handler
 */
dwr.util.borderFadeHighlightHandler = function(ele) {
  ele.style.borderWidth = "2px";
  ele.style.borderStyle = "solid";
  dwr.util._borderFadeProcess(ele, 0);
};
dwr.util._borderFadeSteps = [ "d0", "b0", "a0", "90", "98", "a0", "a8", "b0", "b8", "c0", "c8", "d0", "d8", "e0", "e8", "f0", "f8" ];
dwr.util._borderFadeProcess = function(ele, colorIndex) {
  ele = dwr.util.byId(ele);
  if (colorIndex < dwr.util._borderFadeSteps.length) {
    ele.style.borderColor = "#ff" + dwr.util._borderFadeSteps[colorIndex] + dwr.util._borderFadeSteps[colorIndex];
    setTimeout("dwr.util._borderFadeProcess('" + dwr.util._getId(ele) + "'," + (colorIndex + 1) + ")", 200);
  }
  else {
    ele.style.backgroundColor = "transparent";
  }
};

/**
 * A focus highlight handler
 */
dwr.util.focusHighlightHandler = function(ele) {
  try {
    ele.focus();
  }
  catch (ex) { /* ignore */ }
};

/** @private the current global highlight style */
dwr.util._highlightHandler = null;

/**
 * Highlight that an element has changed
 */
dwr.util.highlight = function(ele, options) {
  if (options && options.highlightHandler) {
    options.highlightHandler(dwr.util.byId(ele));
  }
  else if (dwr.util._highlightHandler != null) {
    dwr.util._highlightHandler(dwr.util.byId(ele));
  }
};

/**
 * Set the value an HTML element to the specified value.
 */
dwr.util.setValue = function(ele, val, options) {
  if (val == null) val = "";
  if (options == null) options = {};

  var orig = ele;
  ele = dwr.util.byId(ele); // Returns null if argument is a name, even on IE
  var nodes = null;
  if (ele == null) {
    // Now it is time to look by name
    nodes = document.getElementsByName(orig);
    if (nodes.length >= 1) ele = nodes.item(0);
  }

  if (ele == null) {
    dwr.util._debug("setValue() can't find an element with id/name: " + orig + ".");
    return;
  }

  // All paths now lead to some update so we highlight a change
  dwr.util.highlight(ele, options);

  if (dwr.util._isHTMLElement(ele, "select")) {
    if (ele.type == "select-multiple" && dwr.util._isArray(val)) dwr.util._selectListItems(ele, val);
    else dwr.util._selectListItem(ele, val);
    return;
  }

  if (dwr.util._isHTMLElement(ele, "input")) {
    if (ele.type == "radio" || ele.type == "checkbox") {
      if (nodes && nodes.length >= 1) {
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes.item(i);
          if (node.type != ele.type) continue;
          if (dwr.util._isArray(val)) {
            node.checked = false;
            for (var j = 0; j < val.length; j++)
              if (val[j] == node.value) node.checked = true;
          }
          else {
            node.checked = (node.value == val);
          }
        }
      }
      else {
        ele.checked = (val == true);
      }
    }
    else ele.value = val;

    return;
  }

  if (dwr.util._isHTMLElement(ele, "textarea")) {
    ele.value = val;
    return;
  }

  if (dwr.util._isHTMLElement(ele, "img")) {
    ele.src = val;
    return;
  }

  // If the value to be set is a DOM object then we try importing the node
  // rather than serializing it out
  if (val.nodeType) {
    if (val.nodeType == 9 /*Node.DOCUMENT_NODE*/) val = val.documentElement;
    val = dwr.util._importNode(ele.ownerDocument, val, true);
    ele.appendChild(val);
    return;
  }

  // Fall back to innerHTML and friends
  if (dwr.util._shouldEscapeHtml(options)) {
    if ("textContent" in ele) ele.textContent = val.toString();
    else if ("innerText" in ele) ele.innerText = val.toString();
    else ele.innerHTML = dwr.util.escapeHtml(val.toString());
  }
  else {
    ele.innerHTML = val;
  }
};

/**
 * @private Find multiple items in a select list and select them. Used by setValue()
 * @param ele The select list item
 * @param val The array of values to select
 */
dwr.util._selectListItems = function(ele, val) {
  // We deal with select list elements by selecting the matching option
  // Begin by searching through the values
  var found  = 0;
  var i;
  var j;
  for (i = 0; i < ele.options.length; i++) {
    ele.options[i].selected = false;
    for (j = 0; j < val.length; j++) {
      if (ele.options[i].value == val[j]) {
        ele.options[i].selected = true;
        found++;
      }
    }
  }
  // If that fails then try searching through the visible text
  if (found == val.length) return;

  for (i = 0; i < ele.options.length; i++) {
    for (j = 0; j < val.length; j++) {
      if (ele.options[i].text == val[j]) {
        ele.options[i].selected = true;
      }
    }
  }
};

/**
 * @private Find an item in a select list and select it. Used by setValue()
 * @param ele The select list item
 * @param val The value to select
 */
dwr.util._selectListItem = function(ele, val) {
  // We deal with select list elements by selecting the matching option
  // Begin by searching through the values
  var found = false;
  var i;
  for (i = 0; i < ele.options.length; i++) {
    if (ele.options[i].value == val) {
      ele.options[i].selected = true;
      found = true;
    }
    else {
      ele.options[i].selected = false;
    }
  }

  // If that fails then try searching through the visible text
  if (found) return;

  for (i = 0; i < ele.options.length; i++) {
    ele.options[i].selected = (ele.options[i].text == val);
  }
};

/**
 * Read the current value for a given HTML element.
 */
dwr.util.getValue = function(ele, options) {
  if (options == null) options = {};
  var orig = ele;
  ele = dwr.util.byId(ele); // Returns null if argument is a name, even on IE
  var nodes = null;
  if (ele == null) {
    // Now it is time to look by name
    nodes = document.getElementsByName(orig);
    if (nodes.length >= 1) ele = nodes.item(0);
  }
  if (ele == null) {
    dwr.util._debug("getValue() can't find an element with id/name: " + orig + ".");
    return "";
  }

  if (dwr.util._isHTMLElement(ele, "select")) {
    // Using "type" property instead of "multiple" as "type" is an official 
    // client-side property since JS 1.1
    if (ele.type == "select-multiple") {
      var reply = new Array();
      for (var i = 0; i < ele.options.length; i++) {
        var item = ele.options[i];
        if (item.selected) {
          var valueAttr = item.getAttributeNode("value");
          if (valueAttr && valueAttr.specified) {
            reply.push(item.value);
          }
          else {
            reply.push(item.text);
          }
        }
      }
      return reply;
    }
    else {
      var sel = ele.selectedIndex;
      if (sel != -1) {
        var item = ele.options[sel];
        var valueAttr = item.getAttributeNode("value");
        if (valueAttr && valueAttr.specified) {
          return item.value;
        }
        return item.text;
      }
      else {
        return "";
      }
    }
  }

  if (dwr.util._isHTMLElement(ele, "input")) {
    if (ele.type == "radio") {
      if (nodes && nodes.length >= 1) {
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes.item(i);
          if (node.type == ele.type) {
            if (node.checked) return node.value;
          }
        }
      }
      return ele.checked;
    }
    if (ele.type == "checkbox") {
      if (nodes && nodes.length >= 1) {
        var reply = [];
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes.item(i);
          if (node.type == ele.type) {
            if (node.checked) reply.push(node.value);
          }
        }
        return reply;
      }
      return ele.checked;
    }
    if (ele.type == "file") {
      return ele;
    }
    return ele.value;
  }

  if (dwr.util._isHTMLElement(ele, "textarea")) {
    return ele.value;
  }

  if (dwr.util._shouldEscapeHtml(options)) {
    if ("textContent" in ele) return ele.textContent;
    else if ("innerText" in ele) return ele.innerText;
  }
  return ele.innerHTML;
};

/**
 * getText() is like getValue() except that it reads the text (and not the value) from select elements
 */
dwr.util.getText = function(ele) {
  ele = dwr.util._getElementById(ele, "getText()");
  if (ele == null) return null;
  if (!dwr.util._isHTMLElement(ele, "select")) {
    dwr.util._debug("getText() can only be used with select elements. Attempt to use: " + dwr.util._detailedTypeOf(ele) + " from  id: " + orig + ".");
    return "";
  }

  // This is a bit of a scam because it assumes single select
  // but I'm not sure how we should treat multi-select.
  var sel = ele.selectedIndex;
  if (sel != -1) {
    return ele.options[sel].text;
  }
  else {
    return "";
  }
};

/**
 * Given a map, or a recursive structure consisting of arrays and maps, call 
 * setValue() for all leaf entries and use intermediate levels to form nested
 * element ids.
 */
dwr.util.setValues = function(data, options) {
  var prefix = "";
  var depth = 100;
  if (options && "prefix" in options) prefix = options.prefix;
  if (options && "idPrefix" in options) prefix = options.idPrefix;
  if (options && "depth" in options) depth = options.depth;
  dwr.util._setValuesRecursive(data, prefix, depth, options);
};

/**
 * @private Recursive helper for setValues()
 */
dwr.util._setValuesRecursive = function(data, idpath, depth, options) {
  if (depth == 0) return;
  // Array containing objects -> add "[n]" to prefix and make recursive call
  // for each item object
  if (dwr.util._isArray(data) && data.length > 0 && dwr.util._isObject(data[0])) {
    for (var i = 0; i < data.length; i++) {
      dwr.util._setValuesRecursive(data[i], idpath+"["+i+"]", depth-1, options);
    }
  }
  // Object (not array) -> handle nested object properties
  else if (dwr.util._isObject(data) && !dwr.util._isArray(data)) {
    for (var prop in data) {
      var subidpath = idpath ? idpath+"."+prop : prop;
      // Object (not array), or array containing objects -> call ourselves recursively
      if (dwr.util._isObject(data[prop]) && !dwr.util._isArray(data[prop]) && !dwr.util._isDate(data[prop]) 
          || dwr.util._isArray(data[prop]) && data[prop].length > 0 && dwr.util._isObject(data[prop][0])) {
        dwr.util._setValuesRecursive(data[prop], subidpath, depth-1, options);
      }
      // Functions -> skip
      else if (typeof data[prop] == "function") {
        // NOP
      }
      // Only simple values left (or array of simple values, or empty array)
      // -> call setValue()
      else {
        // Are there any elements with that id or name
        if (dwr.util.byId(subidpath) != null || document.getElementsByName(subidpath).length >= 1) {
          dwr.util.setValue(subidpath, data[prop], options);
        }
      }
    }
  }
};

/**
 * Given a map, or a recursive structure consisting of arrays and maps, call 
 * getValue() for all leaf entries and use intermediate levels to form nested
 * element ids.
 * Given a string or element that refers to a form, create an object from the 
 * elements of the form.
 */
dwr.util.getValues = function(data, options) {
  if (typeof data == "string" || dwr.util._isHTMLElement(data)) {
    return dwr.util.getFormValues(data);
  }
  else {
    var prefix = "";
    var depth = 100;
    if (options != null && "prefix" in options) prefix = options.prefix;
    if (options != null && "idPrefix" in options) prefix = options.idPrefix;
    if (options != null && "depth" in options) depth = options.depth;
    dwr.util._getValuesRecursive(data, prefix, depth, options);
    return data;
  }
};

/**
 * Given a string or element that refers to a form, create an object from the 
 * elements of the form.
 */
dwr.util.getFormValues = function(eleOrNameOrId) {
  var ele = null;
  if (typeof eleOrNameOrId == "string") {
    ele = document.forms[eleOrNameOrId]; // arg is name
    if (ele == null) ele = dwr.util.byId(eleOrNameOrId); // arg is id
  }
  else if (dwr.util._isHTMLElement(eleOrNameOrId)) {
    ele = eleOrNameOrId; // arg is element
  }
  if (ele != null) {
    if (ele.elements == null) {
      alert("getFormValues() requires an object or reference to a form element.");
      return null;
    }
    var reply = {};
    var name;
    var value;
    for (var i = 0; i < ele.elements.length; i++) {
      if (ele[i].type in {button:0,submit:0,reset:0,image:0,file:0}) continue;
      if (ele[i].name) {
        name = ele[i].name;
        value = dwr.util.getValue(name);
      }
      else {
        if (ele[i].id) name = ele[i].id;
        else name = "element" + i;
        value = dwr.util.getValue(ele[i]);
      }
      reply[name] = value;
    }
    return reply;
  }
};

/**
 * @private Recursive helper for getValues().
 */
dwr.util._getValuesRecursive = function(data, idpath, depth, options) {
  if (depth == 0) return;
  // Array containing objects -> add "[n]" to idpath and make recursive call
  // for each item object
  if (dwr.util._isArray(data) && data.length > 0 && dwr.util._isObject(data[0])) {
    for (var i = 0; i < data.length; i++) {
      dwr.util._getValuesRecursive(data[i], idpath+"["+i+"]", depth-1, options);
    }
  }
  // Object (not array) -> handle nested object properties
  else if (dwr.util._isObject(data) && !dwr.util._isArray(data)) {
    for (var prop in data) {
      var subidpath = idpath ? idpath+"."+prop : prop;
      // Object, or array containing objects -> call ourselves recursively
      if (dwr.util._isObject(data[prop]) && !dwr.util._isArray(data[prop])
          || dwr.util._isArray(data[prop]) && data[prop].length > 0 && dwr.util._isObject(data[prop][0])) {
        dwr.util._getValuesRecursive(data[prop], subidpath, depth-1, options);
      }
      // Functions -> skip
      else if (typeof data[prop] == "function") {
        // NOP
      }
      // Only simple values left (or array of simple values, or empty array)
      // -> call getValue()
      else {
        // Are there any elements with that id or name
        if (dwr.util.byId(subidpath) != null || document.getElementsByName(subidpath).length >= 1) {
          data[prop] = dwr.util.getValue(subidpath);
        }
      }
    }
  }
};

/**
 * Add options to a list from an array or map.
 */
dwr.util.addOptions = function(ele, data/*, options*/) {
  ele = dwr.util._getElementById(ele, "addOptions()");
  if (ele == null) return;
  var useOptions = dwr.util._isHTMLElement(ele, "select");
  var useLi = dwr.util._isHTMLElement(ele, ["ul", "ol"]);
  if (!useOptions && !useLi) {
    dwr.util._debug("addOptions() can only be used with select/ul/ol elements. Attempt to use: " + dwr.util._detailedTypeOf(ele));
    return;
  }
  if (data == null) return;
  
  var argcount = arguments.length;
  var options = {};
  var lastarg = arguments[argcount - 1]; 
  if (argcount > 2 && dwr.util._isObject(lastarg)) {
    options = lastarg;
    argcount--;
  }
  var arg3 = null; if (argcount >= 3) arg3 = arguments[2];
  var arg4 = null; if (argcount >= 4) arg4 = arguments[3];
  if (!options.optionCreator && useOptions) options.optionCreator = dwr.util._defaultOptionCreator;
  if (!options.optionCreator && useLi) options.optionCreator = dwr.util._defaultListItemCreator;
  options.document = ele.ownerDocument;

  var text, value, li;
  if (dwr.util._isArray(data)) {
    // Loop through the data that we do have
    for (var i = 0; i < data.length; i++) {
      options.data = data[i];
      options.text = null;
      options.value = null;
      if (useOptions) {
        if (arg3 != null) {
          if (arg4 != null) {
            options.text = dwr.util._getValueFrom(data[i], arg4);
            options.value = dwr.util._getValueFrom(data[i], arg3);
          }
          else options.text = options.value = dwr.util._getValueFrom(data[i], arg3);
        }
        else options.text = options.value = dwr.util._getValueFrom(data[i]);

        if (options.text != null || options.value) {
          var opt = options.optionCreator(options);
          opt.text = options.text;
          opt.value = options.value;
          ele.options[ele.options.length] = opt;
        }
      }
      else {
        options.value = dwr.util._getValueFrom(data[i], arg3);
        if (options.value != null) {
          li = options.optionCreator(options);
          if (dwr.util._shouldEscapeHtml(options)) {
            options.value = dwr.util.escapeHtml(options.value);
          }
          li.innerHTML = options.value;
          ele.appendChild(li);
        }
      }
    }
  }
  else if (arg4 != null) {
    if (!useOptions) {
      alert("dwr.util.addOptions can only create select lists from objects.");
      return;
    }
    for (var prop in data) {
      options.data = data[prop];
      options.value = dwr.util._getValueFrom(data[prop], arg3);
      options.text = dwr.util._getValueFrom(data[prop], arg4);

      if (options.text != null || options.value) {
        var opt = options.optionCreator(options);
        opt.text = options.text;
        opt.value = options.value;
        ele.options[ele.options.length] = opt;
      }
    }
  }
  else {
    if (!useOptions) {
      dwr.util._debug("dwr.util.addOptions can only create select lists from objects.");
      return;
    }
    for (var prop in data) {
      if (typeof data[prop] == "function") continue;
      options.data = data[prop];
      if (arg3 == null) {
        options.value = prop;
        options.text = data[prop];
      }
      else {
        options.value = data[prop];
        options.text = prop;
      }
      if (options.text != null || options.value) {
        var opt = options.optionCreator(options);
        opt.text = options.text;
        opt.value = options.value;
        ele.options[ele.options.length] = opt;
      }
    }
  }

  // All error routes through this function result in a return, so highlight now
  dwr.util.highlight(ele, options); 
};

/**
 * @private Get the data from an array function for dwr.util.addOptions
 */
dwr.util._getValueFrom = function(data, method) {
  if (method == null) return data;
  else if (typeof method == 'function') return method(data);
  else return data[method];
};

/**
 * @private Default option creation function
 */
dwr.util._defaultOptionCreator = function(options) {
  return options.document.createElement("option");
};

/**
 * @private Default list item creation function
 */
dwr.util._defaultListItemCreator = function(options) {
  return options.document.createElement("li");
};

/**
 * Remove all the options from a select list (specified by id)
 */
dwr.util.removeAllOptions = function(ele) {
  ele = dwr.util._getElementById(ele, "removeAllOptions()");
  if (ele == null) return;
  var useOptions = dwr.util._isHTMLElement(ele, "select");
  var useLi = dwr.util._isHTMLElement(ele, ["ul", "ol"]);
  if (!useOptions && !useLi) {
    dwr.util._debug("removeAllOptions() can only be used with select, ol and ul elements. Attempt to use: " + dwr.util._detailedTypeOf(ele));
    return;
  }
  if (useOptions) {
    ele.options.length = 0;
  }
  else {
    while (ele.childNodes.length > 0) {
      ele.removeChild(ele.firstChild);
    }
  }
};

/**
 * Create rows inside a the table, tbody, thead or tfoot element (given by id).
 */
dwr.util.addRows = function(ele, data, cellFuncs, options) {
  ele = dwr.util._getElementById(ele, "addRows()");
  if (ele == null) return;
  if (!dwr.util._isHTMLElement(ele, ["table", "tbody", "thead", "tfoot"])) {
    dwr.util._debug("addRows() can only be used with table, tbody, thead and tfoot elements. Attempt to use: " + dwr.util._detailedTypeOf(ele));
    return;
  }
  if (!options) options = {};
  if (!options.rowCreator) options.rowCreator = dwr.util._defaultRowCreator;
  if (!options.cellCreator) options.cellCreator = dwr.util._defaultCellCreator;
  options.document = ele.ownerDocument;
  var tr, rowNum;
  if (dwr.util._isArray(data)) {
    for (rowNum = 0; rowNum < data.length; rowNum++) {
      options.rowData = data[rowNum];
      options.rowIndex = rowNum;
      options.rowNum = rowNum;
      options.data = null;
      options.cellNum = -1;
      tr = dwr.util._addRowInner(cellFuncs, options);
      if (tr != null) ele.appendChild(tr);
    }
  }
  else if (typeof data == "object") {
    rowNum = 0;
    for (var rowIndex in data) {
      options.rowData = data[rowIndex];
      options.rowIndex = rowIndex;
      options.rowNum = rowNum;
      options.data = null;
      options.cellNum = -1;
      tr = dwr.util._addRowInner(cellFuncs, options);
      if (tr != null) ele.appendChild(tr);
      rowNum++;
    }
  }

  dwr.util.highlight(ele, options);
};

/**
 * @private The contents we put in empty table cells to workaround IE's border bug.
 */
dwr.util._emptyTableCellReplacement = "<div style='width:0;height:0;overflow:hidden;'></div>";

/**
 * @private Internal function to draw a single row of a table.
 */
dwr.util._addRowInner = function(cellFuncs, options) {
  var tr = options.rowCreator(options);
  if (tr == null) return null;
  for (var cellNum = 0; cellNum < cellFuncs.length; cellNum++) {
    var func = cellFuncs[cellNum];
    if (typeof func == 'function') options.data = func(options.rowData, options);
    else options.data = func || "";
    options.cellNum = cellNum;
    var td = options.cellCreator(options);
    if (td != null) {
      if ("data" in options) {
        if (dwr.util._isHTMLElement(options.data)) td.appendChild(options.data);
        else {
          if (dwr.util._shouldEscapeHtml(options) && typeof(options.data) == "string") {
            td.innerHTML = dwr.util.escapeHtml(options.data);
          }
          else {
            td.innerHTML = options.data;
          }
        }
      }
      else {
        td.innerHTML = dwr.util._emptyTableCellReplacement;
      }
      tr.appendChild(td);
    }
  }
  return tr;
};

/**
 * @private Default row creation function
 */
dwr.util._defaultRowCreator = function(options) {
  return options.document.createElement("tr");
};

/**
 * @private Default cell creation function
 */
dwr.util._defaultCellCreator = function(options) {
  return options.document.createElement("td");
};

/**
 * Remove all the children of a given node.
 */
dwr.util.removeAllRows = function(ele, options) {
  ele = dwr.util._getElementById(ele, "removeAllRows()");
  if (ele == null) return;
  if (!options) options = {};
  if (!options.filter) options.filter = function() { return true; };
  if (!dwr.util._isHTMLElement(ele, ["table", "tbody", "thead", "tfoot"])) {
    dwr.util._debug("removeAllRows() can only be used with table, tbody, thead and tfoot elements. Attempt to use: " + dwr.util._detailedTypeOf(ele));
    return;
  }
  var child = ele.firstChild;
  var next;
  while (child != null) {
    next = child.nextSibling;
    if (options.filter(child)) {
      ele.removeChild(child);
    }
    child = next;
  }
};

/**
 * dwr.util.byId(ele).className = "X", that we can call from Java easily.
 */
dwr.util.setClassName = function(ele, className) {
  ele = dwr.util._getElementById(ele, "setClassName()");
  if (ele == null) return;
  ele.className = className;
};

/**
 * dwr.util.byId(ele).className += "X", that we can call from Java easily.
 */
dwr.util.addClassName = function(ele, className) {
  ele = dwr.util._getElementById(ele, "addClassName()");
  if (ele == null) return;
  ele.className += " " + className;
};

/**
 * dwr.util.byId(ele).className -= "X", that we can call from Java easily
 * From code originally by Gavin Kistner
 */
dwr.util.removeClassName = function(ele, className) {
  ele = dwr.util._getElementById(ele, "removeClassName()");
  if (ele == null) return;
  var regex = new RegExp("(^|\\s)" + className + "(\\s|$)", 'g');
  ele.className = ele.className.replace(regex, '');
};

/**
 * dwr.util.byId(ele).className |= "X", that we can call from Java easily.
 */
dwr.util.toggleClassName = function(ele, className) {
  ele = dwr.util._getElementById(ele, "toggleClassName()");
  if (ele == null) return;
  var regex = new RegExp("(^|\\s)" + className + "(\\s|$)");
  if (regex.test(ele.className)) {
    ele.className = ele.className.replace(regex, '');
  }
  else {
    ele.className += " " + className;
  }
};

/**
 * Clone a node and insert it into the document just above the 'template' node
 */
dwr.util.cloneNode = function(ele, options) {
  ele = dwr.util._getElementById(ele, "cloneNode()");
  if (ele == null) return null;
  if (options == null) options = {};
  var clone = ele.cloneNode(true);
  if ("idPrefix" in options || "idSuffix" in options) {
    dwr.util._updateIds(clone, options);
  }
  else {
    dwr.util._removeIds(clone);
  }
  ele.parentNode.insertBefore(clone, ele);
  return clone;
};

/**
 * @private Update all of the ids in an element tree
 */
dwr.util._updateIds = function(ele, options) {
  if (options == null) options = {};
  if (dwr.util._getId(ele)) {
    ele.setAttribute("id", 
      ("idPrefix" in options ? options.idPrefix : "") 
      + dwr.util._getId(ele) 
      + ("idSuffix" in options ? options.idSuffix : ""));
  }
  var children = ele.childNodes;
  for (var i = 0; i < children.length; i++) {
    var child = children.item(i);
    if (child.nodeType == 1 /*Node.ELEMENT_NODE*/) {
      dwr.util._updateIds(child, options);
    }
  }
};

/**
 * @private Remove all the Ids from an element
 */
dwr.util._removeIds = function(ele) {
  if (dwr.util._getId(ele)) ele.removeAttribute("id");
  var children = ele.childNodes;
  for (var i = 0; i < children.length; i++) {
    var child = children.item(i);
    if (child.nodeType == 1 /*Node.ELEMENT_NODE*/) {
      dwr.util._removeIds(child);
    }
  }
};

/**
 * Clone a template node and its embedded template child nodes according to
 * cardinalities (of arrays) in supplied data.  
 */
dwr.util.cloneNodeForValues = function(templateEle, data, options) {
  templateEle = dwr.util._getElementById(templateEle, "cloneNodeForValues()");
  if (templateEle == null) return null;
  if (options == null) options = {};
  var idpath;
  if (options.idPrefix != null)
    idpath = options.idPrefix;
  else
    idpath = dwr.util._getId(templateEle) || ""; 
  return dwr.util._cloneNodeForValuesRecursive(templateEle, data, idpath, options);
};

/**
 * @private Recursive helper for cloneNodeForValues(). 
 */
dwr.util._cloneNodeForValuesRecursive = function(templateEle, data, idpath, options) {
  // Incoming array -> make an id for each item and call clone of the template 
  // for each of them
  if (dwr.util._isArray(data)) {
    var clones = [];
    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      var clone = dwr.util._cloneNodeForValuesRecursive(templateEle, item, idpath + "[" + i + "]", options);
      clones.push(clone);
    }
    return clones;
  }
  else
  // Incoming object (not array) -> clone the template, add id prefixes, add 
  // clone to DOM, and then recurse into any array properties if they contain 
  // objects and there is a suitable template
  if (dwr.util._isObject(data) && !dwr.util._isArray(data)) {
    var clone = templateEle.cloneNode(true);
    if (options.updateCloneStyle && clone.style) {
      for (var propname in options.updateCloneStyle) {
        clone.style[propname] = options.updateCloneStyle[propname];
      }
    }
    dwr.util._replaceIds(clone, dwr.util._getId(templateEle), idpath);
    templateEle.parentNode.insertBefore(clone, templateEle);
    dwr.util._cloneSubArrays(data, idpath, options);
    return clone;
  }

  // It is an error to end up here so we return nothing
  return null;
};

/**
 * @private Substitute a leading idpath fragment with another idpath for all 
 * element ids tree, and remove ids that don't match the idpath. 
 */
dwr.util._replaceIds = function(ele, oldidpath, newidpath) {
  var currId = dwr.util._getId(ele);
  if (currId) {
    var newId = null;
    if (currId == oldidpath) {
      newId = newidpath;
    }
    else if (currId.length > oldidpath.length) {
      if (currId.substr(0, oldidpath.length) == oldidpath) {
        var trailingChar = currId.charAt(oldidpath.length);
        if (trailingChar == "." || trailingChar == "[") {
          newId = newidpath + currId.substr(oldidpath.length);
        }
      }
    }
    if (newId) {
      ele.setAttribute("id", newId);
    }
    else {
      ele.removeAttribute("id");
    }
  }
  var children = ele.childNodes;
  for (var i = 0; i < children.length; i++) {
    var child = children.item(i);
    if (child.nodeType == 1 /*Node.ELEMENT_NODE*/) {
      dwr.util._replaceIds(child, oldidpath, newidpath);
    }
  }
};

/**
 * @private Finds arrays in supplied data and uses any corresponding template 
 * node to make a clone for each item in the array. 
 */
dwr.util._cloneSubArrays = function(data, idpath, options) {
  for (prop in data) {
    var value = data[prop];
    // Look for potential recursive cloning in all array properties
    if (dwr.util._isArray(value)) {
      // Only arrays with objects are interesting for cloning
      if (value.length > 0 && dwr.util._isObject(value[0])) {
        var subTemplateId = idpath + "." + prop;
        var subTemplateEle = dwr.util.byId(subTemplateId);
        if (subTemplateEle != null) {
          dwr.util._cloneNodeForValuesRecursive(subTemplateEle, value, subTemplateId, options);
        }
      }
    }
    // Continue looking for arrays in object properties
    else if (dwr.util._isObject(value)) {
      dwr.util._cloneSubArrays(value, idpath + "." + prop, options);
    }
  }
};

/**
 * @private Helper to turn a string into an element with an error message
 */
dwr.util._getElementById = function(ele, source) {
  var orig = ele;
  ele = dwr.util.byId(ele);
  if (ele == null) {
    dwr.util._debug(source + " can't find an element with id: " + orig + ".");
  }
  return ele;
};

/**
 * @private Is the given node an HTML element (optionally of a given type)?
 * @param ele The element to test
 * @param nodeName eg "input", "textarea" - check for node name (optional)
 *         if nodeName is an array then check all for a match.
 */
dwr.util._isHTMLElement = function(ele, nodeName) {
  if (ele == null || typeof ele != "object" || ele.nodeName == null) {
    return false;
  }
  if (nodeName != null) {
    var test = ele.nodeName.toLowerCase();
    if (typeof nodeName == "string") {
      return test == nodeName.toLowerCase();
    }
    if (dwr.util._isArray(nodeName)) {
      var match = false;
      for (var i = 0; i < nodeName.length && !match; i++) {
        if (test == nodeName[i].toLowerCase()) {
          match =  true;
        }
      }
      return match;
    }
    dwr.util._debug("dwr.util._isHTMLElement was passed test node name that is neither a string or array of strings");
    return false;
  }
  return true;
};

/**
 * @private Like typeOf except that more information for an object is returned other than "object"
 */
dwr.util._detailedTypeOf = function(x) {
  var reply = typeof x;
  if (reply == "object") {
    reply = Object.prototype.toString.apply(x); // Returns "[object class]"
    reply = reply.substring(8, reply.length-1);  // Just get the class bit
  }
  return reply;
};

/**
 * @private Object detector. Excluding null from objects.
 */
dwr.util._isObject = function(data) {
  return (data && typeof data == "object");
};

/**
 * @private Array detector. Note: instanceof doesn't work with multiple frames.
 */
dwr.util._isArray = function(data) {
  return (data && Object.prototype.toString.call(data)=="[object Array]");
};

/**
 * @private Array like detector. Note: instanceof doesn't work with multiple frames.
 */
dwr.util._isArrayLike = function(data) {
  return data 
    && (typeof data.length == "number") // must have .length
    && ((data.propertyIsEnumerable && data.propertyIsEnumerable("length")==false) || !data.constructor || data!="[object Object]") // .length must be native prop
    && !dwr.util._isString(data) // don't be fooled by string
    && !dwr.util._isFunction(data) // don't be fooled by function
    && !data.tagName; // don't be fooled by elements
};

/**
 * @private String detector.
 */
dwr.util._isString = function(data) {
  return (data && (typeof data == "string" || Object.prototype.toString.call(data) == "[object String]"));
};

/**
 * @private Function detector.
 */
dwr.util._isFunction = function(data) {
  return (data && (typeof data == "function" || Object.prototype.toString.call(data) == "[object Function]") 
    && data != "[object NodeList]"); // need to workaround NodeList on Safari
};

/**
 * @private Date detector. Note: instanceof doesn't work with multiple frames.
 */
dwr.util._isDate = function(data) {
  return (data && Object.prototype.toString.call(data)=="[object Date]");
};

/**
 * @private Used by setValue. Gets around the missing functionallity in IE.
 */
dwr.util._importNode = function(doc, importedNode, deep) {
  var newNode;

  if (importedNode.nodeType == 1 /*Node.ELEMENT_NODE*/) {
    newNode = doc.createElement(importedNode.nodeName);

    for (var i = 0; i < importedNode.attributes.length; i++) {
      var attr = importedNode.attributes[i];
      if (attr.nodeValue != null && attr.nodeValue != '') {
        newNode.setAttribute(attr.name, attr.nodeValue);
      }
    }

    if (importedNode.style != null) {
      newNode.style.cssText = importedNode.style.cssText;
    }
  }
  else if (importedNode.nodeType == 3 /*Node.TEXT_NODE*/) {
    newNode = doc.createTextNode(importedNode.nodeValue);
  }

  if (deep && importedNode.hasChildNodes()) {
    for (i = 0; i < importedNode.childNodes.length; i++) {
      newNode.appendChild(dwr.util._importNode(doc, importedNode.childNodes[i], true));
    }
  }

  return newNode;
};

/** @private Used internally when some message needs to get to the programmer */
dwr.util._debug = function(message, stacktrace) {
  var written = false;
  try {
    if (window.console) {
      if (stacktrace && window.console.trace) window.console.trace();
      window.console.log(message);
      written = true;
    }
    else if (window.opera && window.opera.postError) {
      window.opera.postError(message);
      written = true;
    }
  }
  catch (ex) { /* ignore */ }

  if (!written) {
    var debug = document.getElementById("dwr-debug");
    if (debug) {
      var contents = message + "<br/>" + debug.innerHTML;
      if (contents.length > 2048) contents = contents.substring(0, 2048);
      debug.innerHTML = contents;
    }
  }
};
