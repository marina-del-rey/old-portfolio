// figlet conf
figlet.defaults({fontPath: 'https://unpkg.com/figlet@1.4.0/fonts/'});
figlet.preloadFonts(["Standard", "Slant"], ready);

// filesystem
var fs = {
    'projects': {
    },
    'contact.txt': 'files/contact.txt',
};

// current path
var path = [];
var cwd = fs;

// fonts
var fonts = ['Speed', 'Script', 'Shadow', 'Small Keyboard', 'Standard', 'Slant', 'Rectangles', 'Moscow', 'Lean', 'Morse', 'Hex', 'Octal', 'Binary'];

// read from file
function read_from_file (url, callback) {
    return $.get(url, {}, callback);
}

// figlet render
function render(text, font) {
    return new Promise(function(resolve, reject) {
        figlet(text, {
            font: font || 'Standard'
        }, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

// restores directory
function restore_cwd(fs, path) {
    path = path.slice();
    while (path.length) {
        var dir_name = path.shift();
        if (!is_dir(fs[dir_name])) {
           throw new Error('cd: cannot access '+ $.terminal.escape_brackets(dir_name) + ': No such file or directory'); 
        }
        fs = fs[dir_name];
    }
    return fs;
}

// returns true if directory, false if not a directory
function is_dir(obj) {
    return typeof obj === 'object';
}

// returns true if file, false if not a file
function is_file(obj) {                             
    return typeof obj === 'string';
}

// randomize function for header ascii
function randomize() {
    var min = Math.floor(1);
    var max = Math.floor(fonts.length);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// prompt
function prompt(type) {
    return function(callback) {
        var prompt;
        prompt = '[[;#C6AEFF;]marina@site]:' + path.join('/') + '[[;#59baf7;]~]$ ';
        callback(prompt);
    };
}

var commands = {
    cd: function(dir) {
        this.pause();
        if (dir === '/') {
            path = [];
            cwd = restore_cwd(fs, path);
        } else if (dir === "..") {
            if (path.length) {
                path.pop();
                cwd = restore_cwd(fs, path);
            }
        } else if (dir.match(/\//)) {
            var p = dir.replace(/\/$/, '').split('/'.filter(Boolean));
            if(dir[0] !== '/') {
                p = path.concat(p);
            }
            cwd = restore_cwd(fs, path);
            path = p;
        } else if (!is_dir(cwd[dir])) {
            this.error('-bash: cd:' + $.terminal.escape_brackets(dir) + ': No such file or directory');
        } else {
            cwd = cwd[dir];
            path.push(dir);
        }
        this.resume();
    },
    ls: function() {
        if (!is_dir(cwd)) {
            throw new Error('ls: cannot access '+ $.terminal.escape_brackets(cwd) + ': No such file or directory');
        }
        var dir = Object.keys(cwd).map(function(key) {
            if (is_dir(cwd[key])) {
                return key + '/';
            }
            return key;
        });
        this.echo(dir.join('\n'));
    },
    cat: function(file) {
        if (!is_file(cwd[file])) {
            this.error('cat: ' + $.terminal.escape_brackets(file) + ': No such file or directory');
        } else {
            var FILE_URL = cwd[file];
            this.echo(read_from_file(FILE_URL, function(data){ data; }));
        }
    },
    help: function() {
        this.echo('GNU bash, version 5.0.3(1)-release (x86_64-pc-linux-gnu)\nThese shell commands are defined internally.  Type help to see this list.\n\n' + Object.keys(commands).join('\n'));
    },
    whoami: function() {
        var FILE_URL = "files/aboutme.txt";
        this.echo(read_from_file(FILE_URL, function(data){ data; }));
    }
};

function ready() {
    $('#term').terminal(commands, {
        prompt: prompt(),
        autocompleteMenu: true,
        completion: ['cd', 'ls', 'cat'],
        greetings: function() {
            return render("marina", fonts[randomize()]).then(text => text + `\nwelcome! type [[;#fff;]whoami] or [[;#fff;]help] to get started.\n`);
        }
    });
}
