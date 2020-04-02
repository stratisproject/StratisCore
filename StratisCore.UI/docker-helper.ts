import { TextDecoder } from 'text-encoding';
import * as childProcess from 'child_process';
import * as Docker from 'dockerode';

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
  constructor(private isWindows?: boolean) {
  }

  public runNodeInstance(instance: number, rpcport: number, signalrport: number, apiport: number, isEdge: boolean, outputFunc: (output) => void): Promise<any> {
    console.log('Starting SBFN Instance');

    const docker = new Docker();

    docker.createNetwork({
      'Name': 'Stratis-Hackathon',
      'Driver': 'bridge',
      'Internal': false,
      'IPAM': {
        'Config': [{
          'Subnet': '172.19.0.0/16',
          'Gateway': '172.19.10.01'
        }]
      }
    }, function (err, network) {
      console.log(err);
    });

    return docker.createContainer({
      Image: 'stratisgroupltd/blockchaincovid19',
      Env: [`Instance=${instance}`],
      Cmd: isEdge ? ['-edge'] : [],
      HostConfig: {
        AutoRemove: true,
        PortBindings: {
          '16175/tcp': [
            {HostPort: `${rpcport}`}
          ],
          '37223/tcp': [
            {HostPort: `${apiport}`}
          ],
          '38823/tcp': [
            {HostPort: `${signalrport}`}
          ]
        },
      },
      Hostname: `Node_${instance}`,
      name: `Node_${instance}`
    }).then(function (container) {
      const network = docker.getNetwork('Stratis-Hackathon');
      network.connect({Container: container.id}).then(() => {
          return container.start();
        }
      );
    });
  }

  public downloadImage(image: string): Promise<boolean> {
    console.log(`Downloading Image ${image}`);
    const docker = new Docker();

    return new Promise((resolve, reject) => {
      docker.pull(`${image}:latest`, (error, stream) => {
        docker.modem.followProgress(stream, (progressError, output) => {
          if (progressError) {
            reject(progressError);
            return;
          }
          resolve(output);
        }, (event) => console.log(event));
      });
    });
  }

  public detectDocker(): Promise<boolean> {
    console.log('Detecting Docker');
    const docker = new Docker();
    return docker.version().then(r => {
      return true;
    }).catch(e => {
      return false;
    });
  }
}
