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

    /**
     * @param {class java.lang.String} p0 a param
     * @param {function|Object} callback callback function or options object
     */
    p.sendMessageAuto = function(p0, callback) {
      return dwr.engine._execute(p._path, 'message', 'sendMessageAuto', arguments);
    };

    /**
     * @param {class java.lang.String} p0 a param
     * @param {function|Object} callback callback function or options object
     */
    p.onPageLoad = function(p0, callback) {
      return dwr.engine._execute(p._path, 'message', 'onPageLoad', arguments);
    };
    
    dwr.engine._setObject("message", p);
  }
})();
