# slow-point-store

## abandonware

An idea me and @gmaclennan wanted to try out for storing and querying points
*ludicrously* fast!

..It ended up being ludicrously slow.

## lessons

To anyone else who trods down this path!

The idea was to have a sparse file store of the world, broken down into OSM zoom
16 tiles (2^16 x 2^16 tiles to cover Earth). Writes would be super fast
(`fs.appendFile`), and queries should just be scanning for tile files and
reading them in.

Not so:

- Scanning a large area is very slow: you need to `fs.stat` *many* files
  potentially.
- Appends may be quick, but creating new files has an overhead, too. If your
  data is very spread out, almost every insertion will be a brand new file.
- Huge disk overhead. 50k files that are 20 bytes each: 1mb of data, but nearly
  200mb of actual FS use.

