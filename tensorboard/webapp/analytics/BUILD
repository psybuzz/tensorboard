load("//tensorboard/defs:defs.bzl", "tf_ts_library")
load("@npm_angular_bazel//:index.bzl", "ng_module")

package(default_visibility = ["//tensorboard:internal"])

ng_module(
    name = "analytics",
    srcs = [
        "analytics_module.ts",
        "index.ts",
    ],
    deps = [
        "//tensorboard/webapp/analytics/effects",
        "//tensorboard/webapp/core/actions",
        "//tensorboard/webapp/core/store",
        "@npm//@angular/core",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
    ],
)

tf_ts_library(
    name = "test_lib",
    testonly = True,
    srcs = [
        "analytics_test.ts",
    ],
    tsconfig = "//:tsconfig-test",
    deps = [
        ":analytics",
        "//tensorboard/webapp/core/actions",
        "//tensorboard/webapp/core/testing",
        "//tensorboard/webapp/types",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
    ],
)
