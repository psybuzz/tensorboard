load("//tensorboard/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorboard:internal"])

licenses(["notice"])

tf_ts_library(
    name = "routes",
    srcs = [
        "index.ts",
    ],
    deps = [
        ":core_deeplink_provider",
        "//tensorboard/webapp/app_routing:route_config",
        "//tensorboard/webapp/app_routing:types",
        "//tensorboard/webapp/tb_wrapper",
        "@npm//@angular/core",
    ],
)

tf_ts_library(
    name = "core_deeplink_provider",
    srcs = [
        "core_deeplink_provider.ts",
    ],
    deps = [
        "//tensorboard/webapp:app_state",
        "//tensorboard/webapp:selectors",
        "//tensorboard/webapp/app_routing:deep_link_provider",
        "//tensorboard/webapp/app_routing:route_config",
        "//tensorboard/webapp/app_routing:types",
        "//tensorboard/webapp/metrics:types",
        "//tensorboard/webapp/metrics/data_source:types",
        "//tensorboard/webapp/tb_wrapper",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "routes_test_lib",
    testonly = True,
    srcs = [
        "core_deeplink_provider_test.ts",
    ],
    deps = [
        ":core_deeplink_provider",
        "//tensorboard/webapp:app_state",
        "//tensorboard/webapp:selectors",
        "//tensorboard/webapp/angular:expect_angular_core_testing",
        "//tensorboard/webapp/angular:expect_ngrx_store_testing",
        "//tensorboard/webapp/app_routing:deep_link_provider",
        "//tensorboard/webapp/app_routing:types",
        "//tensorboard/webapp/metrics:test_lib",
        "//tensorboard/webapp/metrics/data_source:types",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
        "@npm//rxjs",
    ],
)
