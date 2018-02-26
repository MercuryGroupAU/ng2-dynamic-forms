const gulp = require("gulp"),
    runSequence = require("run-sequence"),
    pkg = require("./package.json");

const TASK_BUNDLE_ROLLUP = require("./build/tasks/bundle-rollup-stream"),
    TASK_CLEAN = require("./build/tasks/clean"),
    TASK_COPY = require("./build/tasks/copy"),
    TASK_INCREMENT_VERSION = require("./build/tasks/increment-version"),
    TASK_INLINE_NG2_TEMPLATES = require("./build/tasks/inline-ng2-templates"),
	TASK_INLINE_RESOURCES = require("./build/tasks/inline-resources"),
    TASK_LINT_TYPESCRIPT = require("./build/tasks/lint-typescript"),
    TASK_PREPROCESS = require("./build/tasks/preprocess"),
    TASK_REMOVE_MODULE_ID = require("./build/tasks/remove-module-id"),
    TASK_TRANSPILE_TYPESCRIPT = require("./build/tasks/transpile-typescript"),
    TASK_NGC = require("./build/tasks/ngc"),
    TASK_DOC_TYPESCRIPT = require("./build/tasks/doc-typescript");

const NPM_SCOPE = "@ng-dynamic-forms",
    SRC_PATH = "./packages",
    DIST_BASE_PATH = "./dist",
    DIST_PATH = `${DIST_BASE_PATH}/${NPM_SCOPE}`,
    TMP_ROOT = "./.tmp",
    TMP_BASE_PATH = `${TMP_ROOT}/.src`,
    TMP_PATH = `${TMP_BASE_PATH}/${NPM_SCOPE}`,
    BUILD_BASE_PATH = `${TMP_ROOT}/.build`,
    BUILD_PATH = `${BUILD_BASE_PATH}/${NPM_SCOPE}`,
    NPM_BASE_PATH = "./node_modules",
    NPM_PATH = `${NPM_BASE_PATH}/${NPM_SCOPE}`,
    TEST_PATH = "./test",
    PACKAGE_TASKS = [],
    PACKAGES = [
        //"core",
        // "ui-basic",
        "ui-bootstrap"
        // "ui-foundation",
        // "ui-ionic",
        // "ui-kendo",
        // "ui-material",
        // "ui-ng-bootstrap",
        //"ui-primeng"
    ],
    INCLUDE_TYPESCRIPT = [
        "ui-bootstrap"
    ];
	  
PACKAGES.forEach(packageName => {

    let ngcName = `ngc:${packageName}`;
    let bundleName = `bundle:${packageName}`;

    gulp.task(ngcName, TASK_NGC(`${TMP_PATH}/${packageName}/tsconfig.json`));
    PACKAGE_TASKS.push(ngcName);

    gulp.task(bundleName, TASK_BUNDLE_ROLLUP(BUILD_PATH, packageName, "ng2DF", pkg, DIST_PATH));
    PACKAGE_TASKS.push(bundleName);
});


gulp.task("rollup:core:build",
    TASK_BUNDLE_ROLLUP(BUILD_PATH, "core", "ng2DF", pkg, BUILD_PATH));

gulp.task("increment:version:major",
    TASK_INCREMENT_VERSION(pkg, ["./package.json", `${SRC_PATH}/**/package.json`], "MAJOR", SRC_PATH));

gulp.task("increment:version:minor",
    TASK_INCREMENT_VERSION(pkg, ["./package.json", `${SRC_PATH}/**/package.json`], "MINOR", SRC_PATH));

gulp.task("increment:version:patch",
    TASK_INCREMENT_VERSION(pkg, ["./package.json", `${SRC_PATH}/**/package.json`], "PATCH", SRC_PATH));


gulp.task("lint:packages",
    TASK_LINT_TYPESCRIPT([`${SRC_PATH}/**/*.ts`], "./tslint.json"));


gulp.task("clean:dist",
    TASK_CLEAN(`${DIST_BASE_PATH}`));

gulp.task("clean:tmp",
    TASK_CLEAN(`${TMP_ROOT}`));

gulp.task("clean:build",
    TASK_CLEAN(`${BUILD_BASE_PATH}`));

gulp.task("clean:test",
    TASK_CLEAN(`${TEST_PATH}/**/*`));

gulp.task("clean:dist:npm",
    TASK_CLEAN(`${NPM_PATH}**/*`));


gulp.task("copy:packages:dist",
    TASK_COPY([`${SRC_PATH}/**/*.*`], DIST_PATH));

gulp.task("copy:core:tmp",
    TASK_COPY([`${SRC_PATH}/**/core/**/*.*`, `${SRC_PATH}/**/tsconfig.*.json`], TMP_PATH));

gulp.task("copy:packages:tmp",
    TASK_COPY([`${SRC_PATH}/**/ui-bootstrap/**/*.*`], TMP_PATH));

gulp.task("copy:packages:test",
    TASK_COPY([`${SRC_PATH}/**/*.{html,ts}`], TEST_PATH));

gulp.task("copy:dist:npm",
    TASK_COPY([`${DIST_BASE_PATH}/**/*.*`], NPM_BASE_PATH));

gulp.task("copy:build:dist",
    TASK_COPY([`${BUILD_BASE_PATH}/**/*.*`,
        `!${BUILD_BASE_PATH}/**/*.js`,
        `!${BUILD_BASE_PATH}/**/*.js.map`], DIST_BASE_PATH));

gulp.task("copy:bundles:dist",
    TASK_COPY([`${BUILD_BASE_PATH}/**/bundles/*.js`], DIST_BASE_PATH));

gulp.task("copy:package:dist",
    TASK_COPY([`${TMP_PATH}/**/package.json`], DIST_PATH));

gulp.task("copy:tmp:npm",
    TASK_COPY([`${TMP_BASE_PATH}/**/*.*`], NPM_BASE_PATH));


gulp.task("preprocess:packages:dist",
    TASK_PREPROCESS(`${DIST_PATH}/**/*.js`, DIST_PATH));

gulp.task("preprocess:packages:tmp",
    TASK_PREPROCESS(`${TMP_PATH}/**/*.js`, TMP_PATH));

// gulp.task("inline:ng2-templates:dist",
    // TASK_INLINE_NG2_TEMPLATES(`${DIST_PATH}/**/*.js`));

gulp.task("inline:resources:dist", function () {
    return Promise.resolve()
        .then(() => TASK_INLINE_RESOURCES(`${DIST_PATH}`));
});	
	
gulp.task("inline:resources:tmp", function () {
    return Promise.resolve()
        .then(() => TASK_INLINE_RESOURCES(`${TMP_PATH}`));
});
    

gulp.task("remove:moduleId:dist",
    TASK_REMOVE_MODULE_ID([`${DIST_PATH}/**/*`], DIST_PATH));

gulp.task("remove:moduleId:tmp",
    TASK_REMOVE_MODULE_ID([`${TMP_PATH}/**/*`], TMP_PATH));


gulp.task("transpile:packages:dist",
    TASK_TRANSPILE_TYPESCRIPT([`${DIST_PATH}/**/*.ts`], DIST_PATH, "./tsconfig.packages.json", "es6"));

gulp.task("transpile:packages:tmp",
    TASK_TRANSPILE_TYPESCRIPT([`${TMP_PATH}/**/*.ts`], BUILD_PATH, "./tsconfig.packages.json", "es6"));

gulp.task("transpile:packages:debug",
    TASK_TRANSPILE_TYPESCRIPT([`${DIST_PATH}/**/*.ts`], DIST_PATH, "./tsconfig.packages.json", "commonjs"));

gulp.task("transpile:packages:test",
    TASK_TRANSPILE_TYPESCRIPT([`${TEST_PATH}/**/*.ts`], TEST_PATH, "./tsconfig.packages.json", "commonjs"));

gulp.task("ngc:core:tmp",
    TASK_NGC(`${TMP_PATH}/core/tsconfig.json`));


gulp.task("build:packages:debug", function (done) {

    runSequence(
        "transpile:packages:debug",
        done
    );
});

gulp.task("build:packages:dist", function (done) {

    runSequence(
        "lint:packages",
        "clean:tmp",
        "clean:build",
        "copy:core:tmp",
        "inline:resources:tmp",
        //"preprocess:packages:tmp",
        //"transpile:packages:tmp",
        "ngc:core:tmp",
        "rollup:core:build",
        "clean:dist",
        "copy:build:dist",
        "copy:bundles:dist",
        "copy:package:dist",
		"copy:dist:npm",
        
        //"clean:tmp",
        "copy:packages:tmp",
        "inline:resources:tmp",
        //"preprocess:packages:tmp",
        //"transpile:packages:tmp",
        ...PACKAGE_TASKS,
        "copy:build:dist",
        "copy:bundles:dist",
        "copy:package:dist",
        //"remove:moduleId:dist",
		"copy:dist:npm",
        //"clean:tmp",
        //"clean:tmp:build",
        done
    );
});

gulp.task("build:packages:test", function (done) {

    runSequence(
        "clean:test",
        "copy:packages:test",
        "transpile:packages:test",
        done
    );
});


gulp.task("build:packages", function (done) {

    runSequence(
        "build:packages:dist",
        "copy:dist:npm",
        "build:packages:test",
        done
    );
});


gulp.task("doc:packages",
    TASK_DOC_TYPESCRIPT([`${SRC_PATH}/*/src/**/!(*.spec).ts`], {
            externalPattern: `${DIST_PATH}/**/*.*`,
            excludeExternals: true,
            experimentalDecorators: true,
            ignoreCompilerErrors: true,
            includeDeclarations: true,
            module: "commonjs",
            name: "ng Dynamic Forms",
            out: "docs/",
            readme: "none",
            target: "es6",
            theme: "minimal"
        }
    ));


gulp.task("watch:packages", function () {
    gulp.watch([`${SRC_PATH}/**/*.*`], ["build:packages"]);
});