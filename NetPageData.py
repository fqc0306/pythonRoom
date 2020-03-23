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
	response = opener.open(url)

	html = response.read().decode('utf-8')
	soup = BeautifulSoup(html, "html.parser", from_encoding="utf-8")

	return soup


def writeFile(dictObj, fileName):

	jsStr = json.dumps(dictObj, ensure_ascii=False, sort_keys=False)##ensure_ascii=False 保证中文不乱码
	jsStr = jsStr + '\n'

	f = codecs.open(fileName,'ab+','utf-8')
	f.write(jsStr)

#whichBuild+房间号 为id
def getAllRoom(name, whichBuild, url):
	soup = getSoupByUrl(url)

	tables = soup.find_all(id="table_Buileing")
	alldivs = tables[0].find_all("div")
	index = 0

	for i in alldivs:
		print ("------------------")
		style = i.get("style").split(";")[1]##房间的售卖状态

		print(style)
		link = i.find("a")
		print(link.text + ":" + link.get("href"))
		href = "http://bjjs.zjw.beijing.gov.cn" + link.get("href")

		soup = getSoupByUrl(href)
		desc = soup.find_all(id='desc')
		
		roomDict = collections.OrderedDict()
		statusDict = collections.OrderedDict()
		index = index + 1
		roomDict.update({'id' : index})
		roomDict.update({'build' :  whichBuild.split("#")[0]})
		roomDict.update({'unit' : link.text.split("-")[0]})
		roomDict.update({'room' : link.text.split("-")[1]})

		statusDict.update({'id' : index})
		statusDict.update({'build' :  whichBuild.split("#")[0]})
		statusDict.update({'unit' : link.text.split("-")[0]})
		statusDict.update({'room' : link.text.split("-")[1]})
		statusDict.update({'status' : style.split("#")[1]})

		writeFile(statusDict, name + "_dynamic.json")

		if desc.__len__() > 13:
			
			roomDict.update({'square_all' : desc[7].text.split(' ')[0]})
			roomDict.update({'square_in' : desc[9].text.split(' ')[0]})
			roomDict.update({'price_all' : desc[11].text.split(' ')[0]})
			roomDict.update({'price_in' : desc[13].text.split(' ')[0]})
			roomDict.update({'type' : desc[5].text.split(' ')[0]})

			writeFile(roomDict, name + ".json")
		else:
			print("length error:" + str(len(desc)) + ",url:" + url)

		print ("------------------")

	print(alldivs.__len__())

#楼盘中所有楼栋
def getProjectInfo(name, url):
	soup = getSoupByUrl(url)
	rowInfo = []
	# soup.find(attrs={"class":"cont_titlebg"})
	projectName = soup.find_all(id="newslist")[0].find_all("td")[1].text #TODO 存在空格
	print(type(projectName))
	print(projectName)
	infos = table = soup.find_all(id="Span1")[0].find_all("table")[0].find_all("td")
	for info in infos:
		if info.find("a") != None:
			url = "http://bjjs.zjw.beijing.gov.cn" + info.find("a").get("href")
			print(url)
			getAllRoom(name, rowInfo[0], url)
		print(info.text)
		rowInfo.append(info.text)
		if rowInfo.__len__() == 6:#每6项是一行
			rowInfo = []
	print(rowInfo)

timeStr = str(long(time.time()))
#地区内所有楼盘内容
for page in range(1):

	beijingUrl = "http://bjjs.zjw.beijing.gov.cn/eportal/ui?pageId=307678&isTrue=&currentPage=" + str(page+1) + "&pageSize=15"
	print(beijingUrl)
	soup = getSoupByUrl(beijingUrl)

	infos = soup.find_all("form")[1].find_all("table")[6].find_all("td")
	lastUrl = ""
	id = 0

	for index in range(infos.__len__()):
		tag = infos[index].find("a")
		if tag != None:
			url = "http://bjjs.zjw.beijing.gov.cn" + tag.get("href")

			if(lastUrl != url):
				text = tag.text
				line = text + "," + url
				print(line)
				lastUrl = url
				getProjectInfo(text, url)

				buileDict = collections.OrderedDict()
				id = id + 1
				buileDict.update({'id' : id})
				buileDict.update({'name' :  text})
				buileDict.update({'url' : url})
				writeFile(buileDict, "beijing_" + timeStr + ".json")







