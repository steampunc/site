#!/bin/bash

scp -r -i ~/.ssh/finnboire _site/* finn@finnboire.xyz:/home/finn/site-content
