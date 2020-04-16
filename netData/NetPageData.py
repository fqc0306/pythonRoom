#!/usr/local/bin/python
#coding=utf-8

import urllib2
from bs4 import BeautifulSoup
import csv
import json
import codecs
import collections
import time

def getSoupByUrl(url):

	opener = urllib2.build_opener()
	headers = {
	  'User-Agent': 'Mozilla/5.0 (Windows NT 5.1; rv:10.0.1) Gecko/20100101 Firefox/10.0.1',
	}
	opener.addheaders = headers.items()
	tryTimes = 0
	maxTimes = 3
	while (tryTimes < maxTimes):
		try:
			response = opener.open(url)
			html = response.read().decode('utf-8')
			soup = BeautifulSoup(html, "html.parser", from_encoding="utf-8")
			tryTimes = maxTimes
		except Exception as e:
			print('open url:'+url)
			print(e)
			tryTimes = tryTimes + 1


	return soup


def writeFile(dictObj, fileName):

	jsStr = json.dumps(dictObj, ensure_ascii=False, sort_keys=False)##ensure_ascii=False 保证中文不乱码
	jsStr = jsStr + '\n'

	f = codecs.open(fileName,'ab+','utf-8')
	f.write(jsStr)

#whichBuild+房间号 为id
def getAllRoom(name, whichBuild, url, whichProject):
	soup = getSoupByUrl(url)

	tables = soup.find_all(id="table_Buileing")
	alldivs = tables[0].find_all("div")
	index = 0

	for i in alldivs:
		print ("------------------")
		style = i.get("style").split(";")[1]##房间的售卖状态
		link = i.find("a")
		
		roomDict = collections.OrderedDict()
		statusDict = collections.OrderedDict()
		index = index + 1
		roomDict.update({'id' : index})
		roomDict.update({'build' :  whichBuild.split("#")[0]})
		roomDict.update({'project' : whichProject})

		number = None
		try:
			number = int (link.text) #case1:2单元-801 case2:-034
		except UnicodeEncodeError as e:
			print('int error:', e)

		if number == None:
			if link.text.split("-").__len__() >= 2:
				roomDict.update({'unit' : link.text.split("-")[0]})
				roomDict.update({'room' : link.text.split("-")[1]})
			elif link.text.split("-") == 1:
				roomDict.update({'unit' : ""})
				roomDict.update({'room' : link.text.split("-")[0]})
			else:
				print("error length, link text:" + link.text)
		else :
			roomDict.update({'unit' : ""})
			roomDict.update({'room' : link.text})


		statusDict.update({'id' : index})
		statusDict.update({'build' :  whichBuild.split("#")[0]})
		statusDict.update({'project' : whichProject})
		statusDict.update({'status' : style.split("#")[1]})
		if number == None:
			if link.text.split("-").__len__() >= 2:
				statusDict.update({'unit' : link.text.split("-")[0]})
				statusDict.update({'room' : link.text.split("-")[1]})
			elif link.text.split("-") == 1:
				statusDict.update({'unit' : ""})
				statusDict.update({'room' : link.text.split("-")[0]})
			else:
				print("error length, link text:" + link.text)
		else :
			statusDict.update({'unit' : ""})
			statusDict.update({'room' : link.text})

		writeFile(statusDict, name + "_dy.json")


		print(link.text + ":" + link.get("href"))
		href = "http://bjjs.zjw.beijing.gov.cn" + link.get("href")

		soup = getSoupByUrl(href)
		desc = soup.find_all(id='desc')

		tempDict = collections.OrderedDict()
		if desc.__len__()/2 > 0:
			for k in range(desc.__len__()/2):
				key = desc[k*2].text.encode('utf-8').replace(' ', '').replace('　', '')
				
				value = desc[k*2+1].text.split(" ")[0].encode('utf-8').replace(' ', '').replace('　', '')
				tempDict.update({unicode(key, "utf-8") : unicode(value, "utf-8")})

			roomDict.update({'detail' : tempDict})
			writeFile(roomDict, name + ".json")
		else:
			print("length error:" + str(len(desc)) + ",url:" + url)


	print(alldivs.__len__())

#楼盘中所有楼栋
def getProjectInfo(name, url, projectId):
	soup = getSoupByUrl(url)
	detailDict = collections.OrderedDict()
	allItems = []
	buileDict = collections.OrderedDict()
	itemInfo = collections.OrderedDict()
	titleInfo = []
	index = 0
	# 获取楼盘地址，开发商等信息
	tableInfos = soup.find_all(id="newslist")[0].find_all("td")
	for i in range(tableInfos.__len__()/2):
		infoKey = tableInfos[2*i]
		infoValue = tableInfos[2*i+1]
		detailDict.update({infoKey.text.replace(' ', '').replace('\r', '').replace('\n', '') : infoValue.text.replace(' ', '').replace('\r', '').replace('\n', '')})

	buileDict.update({'info': detailDict})

	#获取楼盘所有楼栋的基本信息
	if (soup.find_all(id="Span1").__len__() > 0 and soup.find_all(id="Span1")[0].find_all("table").__len__() > 0):
		infos = table = soup.find_all(id="Span1")[0].find_all("table")[0].find_all("td")
		for info in infos:
			if info.find("a") != None:
				url = "http://bjjs.zjw.beijing.gov.cn" + info.find("a").get("href")
				print(url)
				getAllRoom(name, rowInfo[0], url, projectId)
			infoText = info.text.encode('utf-8').replace('　', '')
			infoText = unicode(infoText, "utf-8")
			if info.find("strong") != None:	#表格的title 均为粗体, --批准销售套数 等内容
				titleInfo.append(infoText)
			else :
				itemInfo.update({titleInfo[index%titleInfo.__len__()] : infoText})

			if (itemInfo.__len__() > 0 and itemInfo.__len__() == titleInfo.__len__()) :
				allItems.append(itemInfo)
				itemInfo = collections.OrderedDict()
			index = index + 1

	buileDict.update({'build_list': allItems})

	global indexTotal, timeStr
	indexTotal = indexTotal + 1
	buileDict.update({'id' : indexTotal})
	buileDict.update({'name' :  text})
	writeFile(buileDict, "beijing_" + timeStr + ".json")

timeStr = str(long(time.time())/(24*60*60))
indexTotal = 0

#地区内所有楼盘内容
for page in range(0, 10):

	beijingUrl = "http://bjjs.zjw.beijing.gov.cn/eportal/ui?pageId=307678&isTrue=&currentPage=" + str(page+1) + "&pageSize=15"
	print(beijingUrl)
	soup = getSoupByUrl(beijingUrl)

	infos = soup.find_all("form")[1].find_all("table")[6].find_all("td")
	lastUrl = ""

	for index in range(0, infos.__len__()):
		print("index:" + str(page) + "," + str(index))

		tag = infos[index].find("a")
		if tag != None:
			url = "http://bjjs.zjw.beijing.gov.cn" + tag.get("href")
			if(lastUrl == url and text != tag.text):
				projectId = tag.text
				line = text + "," + url + ", " + projectId
				print(line)
				getProjectInfo(text, url, projectId)
			else :
				lastUrl = url
				text = tag.text







