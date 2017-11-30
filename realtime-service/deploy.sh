#!/bin/bash

gcloud app deploy --version="$(cat .gae_version)" app.yaml"
