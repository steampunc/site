#!/bin/bash

scp -r -i ~/.ssh/finnboire _site/* finn@steampunc.com:/home/finn/content
