#!/usr/bin/env node

const HELPER_CONTACT_NAME = 'Jerome'

import {
  WechatyBuilder,
  log,
} from 'wechaty'
import QRCode from "qrcode";
import express from "express";

const bot =  WechatyBuilder.build({
  name: "xy-wechat-bot", 
  puppet: "wechaty-puppet-wechat",
  puppetOptions: {
    uos: true
  }
});

bot
.on('scan', async (qrcode, status) => {
  const url = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`;
  console.log(`Scan QR Code to login: ${status}\n${url}`);
  console.log(
    await QRCode.toString(qrcode, { type: "terminal", small: true })
  );
})
.on('logout'	, user => log.info('Bot', `"${user.name()}" logouted`))
.on('error'   , e => log.info('Bot', 'error: %s', e))
.on('login', async function(user) {
  let msg = `${user.name()} logined`

  log.info('Bot', msg)
  await this.say(msg)

})


try {
  await bot.start();
} catch(e) {
  console.error(e);
}

const app = express();

app.get('/test', async (req, res) => {
  //按照群名称查找群
  //若有同名群会有问题
  //建议：记住群的ID（此ID不会改变）
  //通过Room.findAll接口找到所有群，再根据ID进行筛选
  //接口文档参见：https://wechaty.gitbook.io/wechaty/v/zh/api/room#room-findall-query-promise-greater-than
  //const rooms = await Room.findAll();
  const room = await bot.Room.find({topic: 'tt'});
  if(room == null) {
    res.send('cannot find room tt');
    return;
  }

  log.info(room.id);
  log.info(room.payload.topic);
  let owner = room.owner();
  log.info(owner == null ? "" : room.owner().name());
  let memberAll = await room.memberAll()
  memberAll.forEach(async member =>{
    log.info(member.name()); //用户微信名
    log.info(await room.alias(member)) //群里的昵称
  })

  //发送群消息
  await room.say("hello from bot");

  res.send(room);
});

app.listen(3000, () => {
  log.info("HTTP Server Started");
});
