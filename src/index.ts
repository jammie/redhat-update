var request = require('request');
var XmlStream = require('xml-stream');
var fs = require("fs");


export default class Main {
  private redhatUpdateUrl = "http://www.redhat.com/security/data/oval/com.redhat.rhsa-all.xml";

  constructor(redhatUpdateUrl:string) {
    if(redhatUpdateUrl != undefined) {
      this.redhatUpdateUrl = redhatUpdateUrl;
    }
  }

  getUrl = () => {
    console.log(this.redhatUpdateUrl);
    const $this = this;
    const url = this.redhatUpdateUrl;
    const outputPath = "./redhat-update.xml";
    var options = {
      method: 'GET',
      url: url
    };
    try {
      if ( !fs.existsSync( outputPath) ) {
        var reqStream = request( options ).pipe( fs.createWriteStream( outputPath ) );
        reqStream.on( "finish", function () {
          console.log( "download done..." );
        });
      }
      $this.readXML(outputPath);
    } catch(err) {
      console.error(err)
    }
  }

  checkCriteria = (criteria) => {
    var data = {

    };
    return data;
  }

  readXML = ( outputPath =  "./redhat-update.xml" ) => {
    const $this = this;
    const jsonParsedPath ='./redhat-update-output.json';
    try {
      if ( fs.existsSync( jsonParsedPath) ) {
        fs.unlinkSync( jsonParsedPath );
      };

      var readStream = fs.createReadStream(outputPath);
      var writeStream = fs.createWriteStream('./redhat-update-output.json');
      var xml = new XmlStream(readStream);
      var obj = {};
      //xml.preserve('definitions');

      var definitions = []
      xml.on('endElement: definition', function(item) {
        console.log(item);
        var definition = {};
        definition["title"] = item["metadata"]["title"];
        definition["fixed_cve"] = item["metadata"]["advisory"]["cfe"];
        definition["severity"] = item["metadata"]["advisory"]["severity"];
        definition["affected_cpe"] = item["metadata"]["advisory"]["affected_cpe_list"];
        /*
        var criteriaData = {
          "or": [
            {
              "AND": [
                [item["criteria"]["criterion"]["$"]["version"], item["criteria"]["criterion"]["$"]["id"], item["criteria"]["criterion"]["$"]["class"]]
              ]
            },
            {
              "AND": [
                [item["criteria"]["criteria"]["criterion"]["$"]["version"], item["criteria"]["criteria"]["criterion"]["$"]["id"], item["criteria"]["criteria"]["criterion"]["$"]["class"]]
              ]
            },
            {
              "AND": [
                [item["criteria"]["criteria"]["criteria"]["criterion"]["$"]["version"], item["criteria"]["criteria"]["criterion"]["$"]["id"], item["criteria"]["criteria"]["criteria"]["criterion"]["$"]["class"]]
              ]
            }
          ]
        };
        */

        definition["criteria"] = [
          {
            "or": [
              {
                "and": [
                  ["version", "id", "class"]
                ]
              }
            ]
          }
        ];
        definition["criteria"]["or"]["and"].push(criteriaData);
        definitions.push(definition);
        writeStream.write(JSON.stringify({"advisory": definitions}));
      });
      xml.on("end", function() {
      	writeStream.end();
      	console.log("finished");
      });

    } catch(err) {
      console.error(err)
    }

  }
}

let x = new Main();
x.getUrl();
