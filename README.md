shared-state-client
===================

This repository contains the JavaScript client components from the Shared-State library developed for [MediaScape project](http://mediascapeproject.eu/), in a form that can be readily imported for use in browsers and node.js.

This repository includes modifactions to the original MediaScape implementation, as part of the 2-Immerse project.
These modifications can be identified by use of the repository history.

Build Instructions
------------------

Type:

`npm install`

Then type:

`make all`

This will create a dist folder containing a browserfied/minified/babelified library and corresponding source map for the browser and a non-browserified set of source files for use by node.js require().

### Goals

MediaScape targets applications that provide shared experiences across multiple devices.

Shared data is a basic building block in MediaScape. Data synchronization is a central challenge in multi-device application, especially when shared, server-side objects may be modified at any time. A generic service is developed focusing on low update latency, quick onchange notification, consistency among observing clients as well as efficiently providing connecting clients with current state. The service is intended primarily for relatively small volumes of JSON data essential for the application. 

### Authors

- Njål Borch (njaal.borch@norut.no)
- Andreas Bosl (bosl@irt.de)

2-Immerse modifications:

- Jonathan Rennison (jonathan.rennison@bt.com)
* Mark Lomas (Mark.Lomas01@bbc.co.uk)

### License

Unless otherwise stated:

Copyright 2015 Norut Tromsø, Norway.  
Copyright 2015 IRT Munich, Germany.

2-Immerse modifications:  
Copyright 2016-2018 British Telecommunications (BT) PLC.  
Copyright 2016 British Broadcasting Corporation

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
