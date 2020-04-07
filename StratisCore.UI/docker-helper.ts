import * as Docker from 'dockerode';

export class DockerHelper {
  constructor(private isWindows?: boolean) {
  }

  public runNodeInstance(instance: number, rpcport: number, signalrport: number, apiport: number, isDlt: boolean, outputFunc: (output) => void): Promise<any> {
    console.log('Starting SBFN Instance');
    const docker = new Docker();
    docker.getNetwork('Stratis-Hackathon').inspect().catch(() => {
      console.log('Creating Network Stratis-Hackathon');
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
    });


    docker.createVolume(
      {
        'Name': `Node${instance}`,
        'Driver': 'local',
        'Mountpoint': `/var/lib/docker/volumes/node${instance}/_data`,
        'Scope': 'local'
      }, function (err, volume) {
        console.log(err);
      });

    return docker.createContainer({
      Image: 'stratisgroupltd/blockchaincovid19',
      Env: [`Instance=${instance}`],
      Cmd: isDlt ? ['-dlt'] : [],
      HostConfig: {

        AutoRemove: true,
        PortBindings: {
          '16175/tcp': [
            {HostIp: '127.0.0.1', HostPort: `${rpcport}`}
          ],
          '37223/tcp': [
            {HostIp: '127.0.0.1', HostPort: `${apiport}`}
          ],
          '38823/tcp': [
            {HostIp: '127.0.0.1', HostPort: `${signalrport}`}
          ]
        },
        Mounts: [
          {
            Type: 'volume',
            ReadOnly: false,
            Target: '/root',
            Source: `Node${instance}`
          }
        ],
      },
      Hostname: `node_${instance}`,
      name: `node_${instance}`
    }).then((container) => {
      const network = docker.getNetwork('Stratis-Hackathon');
      network.connect({Container: container.id}).then(() => {
          return container.start().then(() => {
            container.attach({stream: true, stdout: true, stderr: true}, (err, stream) => {
              container.modem.demuxStream(stream, process.stdout, process.stderr);
            });
          });
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
    });
  }
}
