# json-dir-listing

[![Build Status](https://travis-ci.org/CalebMorris/node-json-dir-listing.svg?branch=master)](https://travis-ci.org/CalebMorris/node-json-dir-listing)
[![Coverage Status](https://coveralls.io/repos/github/CalebMorris/node-json-dir-listing/badge.svg?branch=master)](https://coveralls.io/github/CalebMorris/node-json-dir-listing?branch=master)

Tool for creating a file that contains the contents and types of everything in the directory.

# Options
- `-d, --dryrun` - Run through the process without actually creating any new files
- `-R, --recursive` - Recursively create listings for all subfolders
- `-o, --output [name]` - Specify the name to use for the file output (default `.listings.json`)
- `-s, --sparse [depth]` - Create listings that only contains n [depth] of children (default `null`)
- `-b, --basepath [root]` - Root for generated relative `path` (default `'.'`)

# Example
1. `mkdir tmp`
1. `touch tmp/test.txt`
1. `json-dir-listing tmp/`
1. Creates `tmp/.listings.json` containing
```
{
  "path":"tmp",
  "name":"tmp",
  "type":"folder",
  "children":[{
    "path":"tmp/test.txt",
    "name":"test.txt",
    "type":"file"
  }]
}
```

# Why?

I wanted to create a dynamic client-only website as my personal CV/blog/whatever, but I didn't want it become bloated with the content itself so I decided to dynamically load and render all the content. The setup I was using doesn't allow directory listings, but allows file access so I created this to get a list of all files in a directory.
