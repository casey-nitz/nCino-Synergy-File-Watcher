var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'nCino Synergy File Watcher',
  description: 'Node application as Windows Service',
  script: 'C:\\Users\\cnitz\\Documents\\GitHub\\nCino-Synergy-File-Watcher\\nodeProject.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();