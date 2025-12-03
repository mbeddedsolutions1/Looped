import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import { pong } from './pong';
import fs from 'fs';
import { exec } from 'child_process';

app.post('/connect', (req: Request, res: Response) => {
    const { ssid, psk } = req.body;

    if (!ssid || !psk) {
        return res.status(400).send("Missing SSID or password.");
    }

    const wpaConf = `
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=US

network={
    ssid="${ssid}"
    psk="${psk}"
}
`;

    fs.writeFile('/etc/wpa_supplicant/wpa_supplicant.conf', wpaConf, (err) => {
        if (err) {
            console.error(err);
            res.send("Failed to save WiFi config");
            return;
        }

        res.send("<h2>WiFi saved! Rebooting...</h2>");

        setTimeout(() => {
            exec('sudo reboot', (err) => {
                if (err) console.error(err);
            });
        }, 3000);
    });
});
