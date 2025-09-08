# Chezmoi toolchain with dynamic version detection
# No hardcoded CHEZMOI_VERSION - version comes from the tool itself

ChezmoiInfo = provider(
    doc = "Information about the chezmoi toolchain",
    fields = {
        "tool": "The chezmoi executable",
        "version": "Version string determined from the tool itself",
        "runtime_files": "Runtime files needed by chezmoi",
    },
)

def _chezmoi_toolchain_impl(ctx):
    """Implementation of chezmoi toolchain rule."""
    tool_path = ctx.attr.chezmoi[DefaultInfo].files_to_run.executable
    
    # Get version directly from the tool (no hardcoded versions!)
    version_result = ctx.execute([tool_path, "--version"])
    if version_result.return_code != 0:
        fail("Could not determine chezmoi version from tool: {}".format(version_result.stderr))
    
    # Parse "chezmoi version v2.40.0, commit abc123, built at..." -> "v2.40.0"
    version_line = version_result.stdout.strip()
    if "version" in version_line:
        # Extract version from "chezmoi version v2.40.0"
        parts = version_line.split()
        for i, part in enumerate(parts):
            if part == "version" and i + 1 < len(parts):
                version = parts[i + 1].rstrip(",")
                break
        else:
            fail("Could not parse version from: {}".format(version_line))
    else:
        fail("Unexpected version output format: {}".format(version_line))
    
    toolchain_info = platform_common.ToolchainInfo(
        chezmoi_info = ChezmoiInfo(
            tool = tool_path,
            version = version,
            runtime_files = ctx.attr.chezmoi[DefaultInfo].files,
        ),
    )
    
    return [toolchain_info]

chezmoi_toolchain = rule(
    implementation = _chezmoi_toolchain_impl,
    attrs = {
        "chezmoi": attr.label(
            executable = True,
            cfg = "exec",
            mandatory = True,
            doc = "The chezmoi executable",
        ),
    },
    provides = [platform_common.ToolchainInfo],
)

def declare_toolchains():
    """Declare all chezmoi toolchains."""
    native.toolchain_type(
        name = "toolchain_type",
        visibility = ["//visibility:public"],
    )
    
    # Register for different platforms
    for os_name in ["linux", "macos", "windows"]:
        for arch in ["amd64", "arm64"]:
            if os_name == "windows" and arch == "arm64":
                continue  # Skip unsupported combination
                
            native.toolchain(
                name = "chezmoi_toolchain_{}_{}_impl".format(os_name, arch),
                exec_compatible_with = [
                    "@platforms//os:{}".format("osx" if os_name == "macos" else os_name),
                    "@platforms//cpu:{}".format("x86_64" if arch == "amd64" else arch),
                ],
                target_compatible_with = [
                    "@platforms//os:{}".format("osx" if os_name == "macos" else os_name),
                    "@platforms//cpu:{}".format("x86_64" if arch == "amd64" else arch),
                ],
                toolchain = ":chezmoi_toolchain_{}_{}_configured".format(os_name, arch),
                toolchain_type = ":toolchain_type",
                visibility = ["//visibility:public"],
            )