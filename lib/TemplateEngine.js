var TemplateEngine = (function (){

   function TemplateEngine(){
   
   }

   TemplateEngine.prototype.evaluateString = function(string, options) {
      return string.replace(/{{=([^}]*)}}/g, function(m, $1) {
        return eval($1);
      });
    };

    TemplateEngine.prototype.replaceGivenObject = function(string, options) {
      var _values = options && options.values || {};

      return string.replace(/{{\s*([^}]*)\s*}}/g, function(m, $1) {
        return _values[$1.trim()];
      });
    };

    TemplateEngine.prototype.replaceGivenArray = function(string, options) {
      var _array = options && options.array || [];

      return string.replace(/{{\s*(\d+)\s*}}/g, function(m, $1) {
        return _array[$1];
      });
    };

    TemplateEngine.prototype.format = function(string, options) {
      string = this.evaluateString(string, options);
      string = this.replaceGivenArray(string, options);
      string = this.replaceGivenObject(string, options);

      return string;
    };.

    return TemplateEngine;
});

module.expports = TemplateEngine;
