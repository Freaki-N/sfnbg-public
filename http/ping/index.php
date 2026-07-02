<?php

$now = time();

echo "now=$now<br>";

$r = file_put_contents('/tmp/last_request', $now);

echo "written=$r<br>";

echo "file=".file_get_contents('/tmp/last_request');

echo getmypid();

echo sys_get_temp_dir();