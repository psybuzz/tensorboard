package(default_visibility = ["//tensorboard:internal"])

load("//tensorboard/defs:defs.bzl", "tf_ts_library")

tf_ts_library(
    name = "analytics",
    srcs = [
        "index.ts",
    ],
    deps = [
        "//tensorboard/webapp/core/actions",
        "//tensorboard/webapp/core/store",
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
