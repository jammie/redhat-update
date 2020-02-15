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

  run = () => {
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
      $this.convertToJSON ( outputPath );
    } catch ( err)  {
      console.error( err )
    }
  }
  convertToJSON = ( outputPath =  "./redhat-update.xml" ) => {
    const $this = this;
    const jsonParsedPath ='./redhat-update-output.json';
    try {
      if ( fs.existsSync( jsonParsedPath )) {
        fs.unlinkSync( jsonParsedPath );
      };

      const readStream = fs.createReadStream( outputPath );
      const writeStream = fs.createWriteStream( './redhat-update-output.json' );
      const xml = new XmlStream( readStream );

      let obj = {};
      let definitions = []

      xml.on( 'endElement: definition', function ( item ) {
        let definition = {};
        definition["title"] = item["metadata"]["title"];
        definition["fixed_cve"] = item["metadata"]["advisory"]["cfe"];
        definition["severity"] = item["metadata"]["advisory"]["severity"];
        definition["affected_cpe"] = item["metadata"]["advisory"]["affected_cpe_list"];
        let criteriaData = [
            {
              "AND": [
                [item["criteria"]["criterion"]["$"]["test_ref"], item["criteria"]["$"]["comment"]],
                [item["criteria"]["criteria"]["criterion"]["$"]["test_ref"], item["criteria"]["criteria"]["criterion"]["$"]["comment"]]
              ]
            },
          ]
        definition["criteria"] = [
          {
            "or": [
              {
                "and": [
                  ["test_ref", "comment"]
                ],
                "or" : criteriaData
              }
            ]
          }
        ];
        definitions.push( definition );
        writeStream.write( JSON.stringify( { "advisory": definitions } ));
      });
      xml.on( "end", function () {
      	writeStream.end();
      	console.log( "finished" );
      });

    } catch ( err ) {
      console.error( err )
    }
  }
}

const main = new Main();
main.run();
