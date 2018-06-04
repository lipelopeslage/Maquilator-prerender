module.exports = function () {
  var selects = [];

  return {
    init: function (sel) {
      selects = sel;
    },
    lazyLoad: function(){
      /*
        1- Achar as imagens e trocar atributos para lazy loading
      */
      console.log("Maquilator start");

      var lazyLoadSelect = {};
      var iframeEmbedSelect = {};
      lazyLoadSelect.query = 'main div.container-fluid .productDetailsPageDescription img';
      iframeEmbedSelect.query = '.cmscomponent-html iframe';
      lazyLoadSelect.func = function (node) {
        var src = node.getAttribute("src");
        var cssClass = node.getAttribute("class") || "";
        node.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==");
        node.setAttribute("data-src", src);
        node.setAttribute("data-src-small", src);
        node.setAttribute("class", "b-lazy "+cssClass);
      }
      iframeEmbedSelect.func = function(node){
        var src = node.getAttribute("src");
        node.removeAttribute('src');
        node.setAttribute('data-src', src);
      }
      selects.push(lazyLoadSelect);
      selects.push(iframeEmbedSelect);
    },
    cleanHtml: function(){
      /*
        2- Remover DTM e outros scripts inúteis
      */
      var cleanHtmlSelect = {};
      var scripts = `script[src^="//assets.adobedtm"], 
          script[src^="./pdp_files"], script[src^="//assets.pinterest"], script[src^="https://apis.google"], 
          script[src^="//apis.google.com/js/api:client.js"], 
          html > head > script[src^="https://"], html > head > script[src^="//"]`;
      var elements = ', div#adobeAnalytics';
      cleanHtmlSelect.query = scripts+elements;
      cleanHtmlSelect.func = function (node) {
        node.createWriteStream({outer:true}).end();
      }
      selects.push(cleanHtmlSelect);
    },
    organizeHtml: function(){
      /*
        3- Organizar scripts e estilos (scripts pra baixo, estilos pra cima)
      */
      var organizeHtmlSelect = {};
      organizeHtmlSelect.query = '.TODO';
      organizeHtmlSelect.func = function (node) {
        // .TODO
      }
      selects.push(organizeHtmlSelect);
    },
    injecCode: function(){
      /*
        4- Injetar lazy-loading
      */
      var injecCodeSelect = {};
      
      var inlineScript = `
      <script type="text/javascript" src="https://cdn.rawgit.com/dinbror/blazy/master/blazy.min.js"></script>
      <script type="text/javascript">
        checkBlazy();
        function checkBlazy(){
          if(typeof Blazy === "undefined"){
            setTimeout(checkBlazy, 100);
          }else{
            setTimeout(inject, 2000);
          }
        }      
        function inject(){
          var body = document.querySelector("body");
          var script = document.createElement("script");
          script.innerHTML = "var bLazy = new Blazy({breakpoints:[{width:420,src:'data-src'}],success:function(element){setTimeout(function(){var parent=element.parentNode;parent.className=parent.className.replace(/\bloading\b/,'');},200);}});(function(){var iframes = document.querySelectorAll('iframe');iframes = [].slice.call(iframes);iframes.map(function(node){var src = node.getAttribute('data-src');if(src){node.setAttribute('src', src);}});})();";
          body.appendChild(script);
        }  
      </script>`;
      
      injecCodeSelect.query = 'head';
      injecCodeSelect.func = function (node) {
        
        var rs = node.createReadStream();
        var ws = node.createWriteStream({outer: false});
        
        // Read the node and put it back into our write stream, 
        // but don't end the write stream when the readStream is closed.
        rs.pipe(ws, {end: false});
          
        // When the read stream has ended, attach our style to the end
        rs.on('end', function(){
          ws.end(inlineScript);
        });
      }
      
      selects.push(injecCodeSelect);
      console.log("Page fit end");
    },
    changeLinks: function(){
      /*
        5- Mudar links
      */
      var styleTag = "<style>";
      var changeLinksSelect = {};
      var cc = 0;
      changeLinksSelect.query = 'html head link[rel="stylesheet"]';
      
      changeLinksSelect.func = function (node) {
        var href = node.getAttribute("href");
        cc++;
        if(cc == 7){          
          styleTag += "@import url('"+href+"');</style>";
          node.createStream({outer:true}).end(styleTag);                    
          styleTag = '<style>';
          cc = 0;
        }else{
          styleTag += "@import url('"+href+"');";
          node.createWriteStream({outer:true}).end();
        }
      }
      
      selects.push(changeLinksSelect);
    }
  }
}()
