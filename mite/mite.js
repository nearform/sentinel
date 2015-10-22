"use strict";

var async = require( 'async' )
var path = require( 'path' )
var fs = require( 'fs' )

module.exports = function( options ) {
  var seneca = this;

  function loadModules( done ) {
    processInjectedFolders( ['constants', 'controller', 'protocol', 'service'], done )
  }

  function processInjectedFolders( folders, done ) {
    console.log( JSON.stringify( folders ) )

    async.waterfall( [
      function( done ) {
        var paths = []
        async.eachSeries( folders, function( item, callback ) {
          var folder = path.resolve( __dirname, item )
          paths.push( folder )
          callback()
        }, function( err ) {
          if( err ) {
            return done( err )
          }
          return done( null, paths )
        } )
      },
      function( paths, done ) {
        var files = [];
        async.eachSeries( paths, function( path, callback ) {
          console.log( 'Processing folder %s', path )
          walkdir( path, function( err, fileList ) {
            console.log( 'walkdir files: %s', fileList )
            if( err ) {
              console.error( err )
              return callback()
            }
            else {
              for( var f = 0; f < fileList.length; f++ ) {
                files.push( fileList[f] );
              }
              return callback()
            }
          } )
        }, function( err ) {
          if( err ) {
            return done( err )
          }
          return done( null, files )
        } )
      },
      function( files, done ) {
        async.eachSeries( files, function( file, callback ) {
          console.log( '##############################################################################' )
          console.log( 'Injecting file: %s', file )
          seneca.use( file, options );
          callback()
        }, function( err ) {
          if( err ) {
            return done( err )
          }
          return done();
        } )
      }],
      function( err, result ) {
        console.log( 'Finished modules injection' )
        done( err, result );
      } )
  }

  function walkdir( dir, done ) {
    var results = [];
    fs.readdir( dir, function( err, list ) {
      if( err ) {
        return done( err );
      }
      var pending = list.length;
      if( !pending ) {
        return done( null, results );
      }
      list.forEach( function( file ) {
        file = dir + '/' + file;
        fs.stat( file, function( err, stat ) {
          if( stat && stat.isDirectory() ) {
            walkdir( file, function( err, res ) {
              results = results.concat( res );
              if( !--pending ) {
                done( null, results );
              }
            } );
          }
          else {
            results.push( file );
            if( !--pending ) {
              done( null, results );
            }
          }
        } );
      } );
    } );
  };

  function init( msg, respond ){
    loadModules( respond )
  }

  seneca.use( 'seneca-crypt', {password: 'e2klsdf56fd'} )
  seneca.add( 'init:mite', init )
}

