#!/bin/bash
cd /home/kavia/workspace/code-generation/powerlifting-warm-up-optimization-3415-3425/powerlifting_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

