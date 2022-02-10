var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
    name:'nCino Synergy File Watcher',
    description: 'Node application as Windows Service',
    script: 'C:\\Users\\cnitz\\Documents\\GitHub\\nCino-Synergy-File-Watcher\\nodeProject.js'
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall',function(){
  console.log('Uninstall complete.');
  console.log('The service exists: ',svc.exists);
});

// Uninstall the service.
svc.uninstall();
