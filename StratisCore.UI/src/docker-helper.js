"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var text_encoding_1 = require("text-encoding");
var childProcess = require("child_process");
var HandleAs;
(function (HandleAs) {
    HandleAs[HandleAs["None"] = 0] = "None";
    HandleAs[HandleAs["Resolve"] = 1] = "Resolve";
    HandleAs[HandleAs["Reject"] = 2] = "Reject";
})(HandleAs = exports.HandleAs || (exports.HandleAs = {}));
var OutputType;
(function (OutputType) {
    OutputType[OutputType["Std"] = 0] = "Std";
    OutputType[OutputType["Error"] = 1] = "Error";
    OutputType[OutputType["Exit"] = 2] = "Exit";
})(OutputType = exports.OutputType || (exports.OutputType = {}));
var DockerHelper = /** @class */ (function () {
    function DockerHelper() {
    }
    DockerHelper.prototype.runNodeInstance = function (instance, rpcport, signalrport, apiport, isEdge, outputFunc) {
        console.log('Starting SBFN Instance');
        var commandArgs = ("run --rm --network=Stratis-Hackathon --hostname Node_" + instance + " --name Node_" + instance + " -p 127.0.0.1:" + rpcport + ":16175 -p 127.0.0.1:" + apiport + ":37223 -p 127.0.0.1:" + signalrport + ":38823 -e Instance=" + instance + " stratisgroupltd/blockchaincovid19 " + (isEdge ? '-edge' : '')).split(' ');
        return this.executeDockerCommand(commandArgs, function (output, outputType) {
            outputFunc(output);
            if (outputType === OutputType.Error) {
                return {
                    handleAs: HandleAs.Reject,
                    value: output
                };
            }
            if (outputType === OutputType.Exit) {
                return {
                    handleAs: HandleAs.Reject,
                    value: output
                };
            }
            if (output.indexOf('Headers.Height:') > -1) {
                return {
                    handleAs: HandleAs.Resolve,
                    value: true
                };
            }
            return {
                handleAs: HandleAs.None,
                value: null
            };
        });
    };
    DockerHelper.prototype.downloadImage = function (image) {
        console.log("Downloading Image " + image);
        var imageArgs = ("image pull " + image + ":latest").split(' ');
        return this.executeDockerCommand(imageArgs, function (output, outputType) {
            if (outputType === OutputType.Error) {
                return {
                    handleAs: HandleAs.Reject,
                    value: output
                };
            }
            if (outputType === OutputType.Exit) {
                return {
                    handleAs: HandleAs.Resolve,
                    value: true
                };
            }
            return {
                handleAs: HandleAs.None,
                value: null
            };
        });
    };
    DockerHelper.prototype.detectDocker = function () {
        console.log('Detecting Docker');
        return this.executeDockerCommand(['-v'], function (output, outputType) {
            if (outputType === OutputType.Error) {
                return {
                    handleAs: HandleAs.Resolve,
                    value: false
                };
            }
            return {
                handleAs: HandleAs.Resolve,
                value: true
            };
        });
    };
    DockerHelper.prototype.detectStratisImage = function (imageName) {
        console.log('Detecting Docker Image');
        var imageArgs = "image ls".split(' ');
        return this.executeDockerCommand(imageArgs, function (output, outputType) {
            if (outputType === OutputType.Error) {
                return {
                    handleAs: HandleAs.Resolve,
                    value: false
                };
            }
            if (outputType === OutputType.Exit) {
                return {
                    handleAs: HandleAs.Resolve,
                    value: false
                };
            }
            if (output.indexOf(imageName) > -1) {
                return {
                    handleAs: HandleAs.Resolve,
                    value: true
                };
            }
            return {
                handleAs: HandleAs.None,
                value: null
            };
        });
    };
    DockerHelper.prototype.executeDockerCommand = function (args, outputHandler) {
        return new Promise(function (resolve, reject) {
            var resolved = false;
            var daemonProcess = childProcess.spawn('docker', args, {
                detached: true
            });
            var handle = function (output, outputType) {
                var response = outputHandler(output, outputType);
                if (response.handleAs === HandleAs.Resolve) {
                    if (!resolved) {
                        resolve(response.value);
                        resolved = true;
                    }
                }
                if (response.handleAs === HandleAs.Reject) {
                    reject(output);
                }
            };
            daemonProcess.on('error', function (err) {
                handle(err, OutputType.Error);
            });
            daemonProcess.stdout.on('data', function (data) {
                var decoded = new text_encoding_1.TextDecoder('utf-8').decode(data);
                handle(decoded, OutputType.Std);
            });
            daemonProcess.stdout.on('exit', function (data) {
                handle(data, OutputType.Exit);
            });
            daemonProcess.stdout.on('close', function (data) {
                handle(data, OutputType.Exit);
            });
        });
    };
    return DockerHelper;
}());
exports.DockerHelper = DockerHelper;
//# sourceMappingURL=docker-helper.js.map