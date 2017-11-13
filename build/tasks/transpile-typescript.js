const gulp       = require("gulp"),
      sourceMaps = require("gulp-sourcemaps"),
      ts         = require("gulp-typescript"),
      util       = require("gulp-util");

module.exports = function (src, dest, configPath, moduleFormat, base) {

    return function () {

        let tsProject = ts.createProject(configPath, {module: moduleFormat});

        util.log(`Using TypeScript ${util.colors.magenta(tsProject.typescript.version)}`);

		var sourceConfig = {};
		if (base)
			sourceConfig.base = base;
		
        return gulp.src(src, sourceConfig)
                   .pipe(sourceMaps.init())
                   .pipe(tsProject(ts.reporter.defaultReporter()))
                   .pipe(sourceMaps.write("."))
                   .pipe(gulp.dest(dest));
    };
};