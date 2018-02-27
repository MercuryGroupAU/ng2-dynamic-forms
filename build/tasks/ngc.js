const run = require("gulp-run"),
    ngc = require('@angular/compiler-cli/src/main').main;

module.exports = tsConfigPath => () => {
    //console.log('tsConfigPath', tsConfigPath);
    return ngc({
        project: `${tsConfigPath}`
    }).then((exitCode) => {
        if (exitCode === 1) {
            // This error is caught in the 'compile' task by the runSequence method callback
            // so that when ngc fails to compile, the whole compile process stops running
            throw new Error('ngc compilation failed');
        }
    });
}