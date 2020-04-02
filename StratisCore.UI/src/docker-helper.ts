import { TextDecoder } from 'text-encoding';
import * as childProcess from 'child_process';

export enum HandleAs {
  None,
  Resolve,
  Reject
}

export enum OutputType {
  Std,
  Error,
  Exit
}

export class DockerHelper {
  constructor() {
  }

  public runNodeInstance(instance: number, rpcport: number, signalrport: number, apiport: number, isEdge: boolean, outputFunc: (output) => void): Promise<any> {
    console.log('Starting SBFN Instance');
    const commandArgs = `run --rm --network=Stratis-Hackathon --hostname Node_${instance} --name Node_${instance} -p 127.0.0.1:${rpcport}:16175 -p 127.0.0.1:${apiport}:37223 -p 127.0.0.1:${signalrport}:38823 -e Instance=${instance} stratisgroupltd/blockchaincovid19 ${isEdge ? '-edge' : ''}`.split(' ');
    return this.executeDockerCommand(commandArgs, (output, outputType) => {
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
  }

  public downloadImage(image: string): Promise<boolean> {
    console.log(`Downloading Image ${image}`);
    const imageArgs = `image pull ${image}:latest`.split(' ');
    return this.executeDockerCommand(imageArgs, (output, outputType) => {
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
  }

  public detectDocker(): Promise<boolean> {
    console.log('Detecting Docker');
    return this.executeDockerCommand(['-v'], (output, outputType) => {
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
  }

  public detectStratisImage(imageName: string): Promise<boolean> {
    console.log('Detecting Docker Image');
    const imageArgs = `image ls`.split(' ');
    return this.executeDockerCommand(imageArgs, (output, outputType) => {
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
  }

  public executeDockerCommand<T>(args: string[], outputHandler: (output: any, outputType?: OutputType) => { handleAs: HandleAs, value?: T }): Promise<T> {
    return new Promise((resolve, reject) => {
      let resolved = false;
      const daemonProcess = childProcess.spawn('docker', args, {
        detached: true
      });

      const handle = (output: any, outputType?: OutputType) => {
        const response = outputHandler(output, outputType);
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

      daemonProcess.on('error', (err) => {
        handle(err, OutputType.Error);

      });

      daemonProcess.stdout.on('data', (data) => {
        const decoded = new TextDecoder('utf-8').decode(data);
        handle(decoded, OutputType.Std);
      });

      daemonProcess.stdout.on('exit', (data) => {
        handle(data, OutputType.Exit);
      });

      daemonProcess.stdout.on('close', (data) => {
        handle(data, OutputType.Exit);
      });
    });
  }
}
