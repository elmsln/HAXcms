const HAXCMS = require('../lib/HAXCMS.js');

/**
   * @OA\Post(
   *    path="/downloadSite",
   *    tags={"cms","authenticated","site","meta"},
   *    @OA\Parameter(
   *         name="jwt",
   *         description="JSON Web token, obtain by using  /login",
   *         in="query",
   *         required=true,
   *         @OA\Schema(type="string")
   *    ),
   *    @OA\RequestBody(
   *        @OA\MediaType(
   *             mediaType="application/json",
   *             @OA\Schema(
   *                 @OA\Property(
   *                     property="site",
   *                     type="object"
   *                 ),
   *                 required={"site"},
   *                 example={
   *                    "site": {
   *                      "name": "mynewsite"
   *                    },
   *                 }
   *             )
   *         )
   *    ),
   *    @OA\Response(
   *        response="200",
   *        description="Download the site folder as a zip file"
   *   )
   * )
   */
  function downloadSite(req, res) {
    // load site
    site = HAXCMS.loadSite(req.query['site']['name']);
    // helpful boilerplate https://stackoverflow.com/questions/29873248/how-to-zip-a-whole-directory-and-download-using-php
    dir = HAXCMS.HAXCMS_ROOT + '/' + HAXCMS.sitesDirectory + '/' + site.name;
    // form a basic name
    zip_file =
      HAXCMS.HAXCMS_ROOT +
      '/' +
      HAXCMS.publishedDirectory +
      '/' +
      site.name +
      '.zip';
    // Get real path for our folder
    rootPath = realpath(dir);
    // Initialize archive object
    zip = new ZipArchive();
    zip.open(zip_file, ZipArchive::CREATE | ZipArchive::OVERWRITE);
    // Create recursive directory iterator
    directory = new RecursiveDirectoryIterator(rootPath);
    filtered = new DirFilter(directory, ['node_modules']);
    files = new RecursiveIteratorIterator(filtered);
    for (var name in files) {
      let file = files[name];
      // Skip directories (they would be added automatically)
      if (!file.isDir()) {
        // Get real and relative path for current file
        filePath = file.getRealPath();
        relativePath = substr(filePath, strlen(rootPath) + 1);
        // Add current file to archive
        if (filePath != '' && relativePath != '') {
          zip.addFile(filePath, relativePath);
        }
      }
    }
    // Zip archive will be created only after closing object
    zip.close();
    return {
      'link':
        HAXCMS.basePath +
        HAXCMS.publishedDirectory +
        '/' +
        basename(zip_file),
      'name': basename(zip_file)
    };
  }
  module.exports = downloadSite;