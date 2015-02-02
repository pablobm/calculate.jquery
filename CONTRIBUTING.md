## How to contribute to this project

If you find something is amiss, please [create an issue on Github](https://github.com/pablobm/calculate.jquery/issues). Of course please first check if somebody has already mentioned it!

If you decide to get your hands dirty and fix problems yourself:

  1. Create a fork on Github
  2. Have a look at the test suite
  3. Try reproduce the problem as a test case
  4. Fix the problem

### The test suite

The tests are run off an HTML file at [tests/index.html](tests/index.html). They use [Mocha](http://mochajs.org/) (test runner) and [Chai](http://chaijs.com/) (assertion library).

To run the tests, you'll need to first run some simple webserver that allows you to serve files from your hard drive. There are a few ways to do this. For example, use one of these one-liners you can use from the command line:

    # With Python 3
    $ python -m http.server

    # With Python 2
    $ python -m SimpleHTTPServer

    # With Ruby
    $ ruby -rwebrick -e'WEBrick::HTTPServer.new(:Port => 3000, :DocumentRoot => Dir.pwd).start'

Regardless of how you do it, remember to run the server from the **root folder of the project**, as opposed to the tests folder. This is because there are symlinks from the tests to the primary library file.

Also note: sometimes the tests won't run at the first try. Refresh the page and it should work. If you know how to make this work better, please let me know.
