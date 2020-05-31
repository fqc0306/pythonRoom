#!/usr/local/bin/python
#coding=utf-8

import urllib2
from bs4 import BeautifulSoup
import csv
import json
import codecs
import collections
import time
import requests

def getSoupByUrl(url):
	tryTimes = 0
	maxTimes = 3
	while (tryTimes < maxTimes):
		try:
			response = requests.get(url)
			soup = BeautifulSoup(response.text, "lxml") 
			break

		except Exception as e:
			print('open url:'+url)
			print(e)
			tryTimes = tryTimes + 1

	return soup



def writeFile(dictObj, fileName, isAppend):

	jsStr = json.dumps(dictObj, ensure_ascii=False, sort_keys=False)##ensure_ascii=False 保证中文不乱码
	if (type(dictObj) == type([])) :
		jsStr = jsStr.replace('},', '},\n')
	jsStr = jsStr + '\n'

	mode = 'ab+'
	if (not isAppend) :
		mode = 'wb'

	file = codecs.open(fileName,mode,'utf-8')
	file.write(jsStr)

#whichBuild+房间号 为id: whickBuild:19#商品住宅; name:青年家园; whichProject:京房售证字(2020)10号
def getAllRoom(name, whichBuild, url, whichProject, allRoomDict, allStatusDict):
	soup = getSoupByUrl(url)
	print(name)
	print(whichBuild)
	print(url)
	print(whichProject)

	builds = soup.find_all(id='divShowBranch') #A座 B座 楼栋信息whichBuild_A座
	aTags = builds[0].find_all("a")
	for tag in aTags:
		enterUrl = tag.get('href')
		# if tag.get('style') == None:
		# 	getAllRoom(name, whichBuild, enterUrl, whichProject, allRoomDict, allStatusDict)

	tables = soup.find_all('table',{'class':'table ta-c table2'})
	trs = tables[0].find_all("tr")
	index = 0

	for tr in trs:
		print ("------------------")
		tds = tr.find_all('td')
		for td in tds:
			aTag = td.find('a')
			if aTag != None and aTag.__len__() > 0:
				style = aTag.text ##房间的售卖状态
				divs = td.find_all('div')
				
				roomDict = collections.OrderedDict()
				statusDict = collections.OrderedDict()

				index = index + 1
				roomDict.update({'id' : index})
				roomDict.update({'build' :  whichBuild.split("#")[0]})
				roomDict.update({'project' : whichProject})

				#link.text case1:2单元-801 case2:-034 case3:-1103a
				if divs.__len__() >= 0:
					roomDict.update({'unit' : ""}) ##深圳没有单元号？
					roomDict.update({'room' : divs[0].text})

				statusDict.update({'id' : index})
				statusDict.update({'build' :  whichBuild.split("#")[0]})
				statusDict.update({'project' : whichProject})
				statusDict.update({'status' : style})

				if divs.__len__() >= 0:
					statusDict.update({'unit' : ""}) ##深圳没有单元号？
					statusDict.update({'room' : divs[0].text})

				allStatusDict.append(statusDict)

				# print(link.text + ":" + link.get("href"))
				# href = "http://bjjs.zjw.beijing.gov.cn" + link.get("href")

				# soup = getSoupByUrl(href)
				# desc = soup.find_all(id='desc')

				# tempDict = collections.OrderedDict()
				# if desc != None and desc.__len__()/2 > 0:
				# 	for k in range(desc.__len__()/2):
				# 		key = desc[k*2].text.encode('utf-8').replace(' ', '').replace('　', '')
						
				# 		value = desc[k*2+1].text.split(" ")[0].encode('utf-8').replace(' ', '').replace('　', '')
				# 		tempDict.update({unicode(key, "utf-8") : unicode(value, "utf-8")})

				# 	roomDict.update({'detail' : tempDict})
				allRoomDict.append(roomDict)
				# else:
				# 	print("length error:" + str(len(desc)) + ",url:" + url)

	# print(alldivs.__len__())

def getMoreBuildInfo(name, url, projectId, allStatusDict, allRoomDict, allItems):
	soup = getSoupByUrl(url)

	itemInfo = collections.OrderedDict()
	titleInfo = []

	if (soup.find_all(id="Span1").__len__() > 0 and soup.find_all(id="Span1")[0].find_all("table").__len__() > 0):

		titles = soup.find_all("table")[0].find_all('th', {'scope':'col'})
		for title in titles:
			titleText = title.text.encode('utf-8').replace('　', '')
			titleText = unicode(titleText, "utf-8")
			print(titleText)
			titleInfo.append(titleText)

		infos = soup.find_all(id="Span1")[0].find_all("table")[0].find_all("tr")
		
		for info in infos:
			tds = info.find_all("td")
			if (tds == None or tds.__len__() == 0) :
				continue
			index = 0
			lastUrl = None
			for td in tds:
				
				infoText = td.text.encode('utf-8').replace('　', '').replace('\n', '').replace('\t', '').replace('\r', '')
				infoText = unicode(infoText, "utf-8")

				print(infoText)
				if td.find("a") != None:
					url = td.find("a").get("href").encode('utf-8').replace('\n', '').replace('\t', '').replace('\r', '')
					url = unicode(url, "utf-8")
					url = "http://bjjs.zjw.beijing.gov.cn" + url

					text = td.find("a").text.encode('utf-8').replace('　', '').replace('\n', '').replace('\t', '').replace('\r', '')
					text = unicode(text, "utf-8")

					if (text != None and text != '') :
						itemInfo.update({titleInfo[index%titleInfo.__len__()] : infoText})

					if (lastUrl != url) :
						lastUrl = url
						getAllRoom(name, itemInfo.get(list(itemInfo.keys())[0]), url, projectId, allRoomDict, allStatusDict)

				itemInfo.update({titleInfo[index%titleInfo.__len__()] : infoText})
				index = index + 1

			allItems.append(itemInfo)
			itemInfo = collections.OrderedDict()
			


#楼盘中所有楼栋
def getCertDetail(certUrl, detailUrl, projectId, name):
	soup = getSoupByUrl(certUrl)
	detailDict = collections.OrderedDict()
	allItems = []
	buileDict = collections.OrderedDict()
	titleInfo = []
	index = 0

	global indexTotal, startIndex, endIndex, timeStr
	buileDict.update({'_id' : indexTotal})
	buileDict.update({'name' :  name + "_" + projectId})

	if (not (indexTotal >= startIndex and indexTotal <= endIndex)) :
		indexTotal = indexTotal + 1
		return False

	indexTotal = indexTotal + 1
	
	# 许可证详细信息
	tableInfos = soup.find_all('table',{'class':'table ta-c table2'})[0].find_all('tr')
	for j in range(tableInfos.__len__()):
		tds = tableInfos[j].find_all('td')
		if tds.__len__() > 1:
			for i in range(tds.__len__()/2):	
				infoKey = tds[2*i].text.replace(' ', '').replace('\r', '').replace('\n', '')
				infoValue = tds[2*i+1].text.replace(' ', '').replace('\r', '').replace('\n', '')
				
				if infoValue.find('--') == -1:
					detailDict.update({infoKey : infoValue})

	#项目详情
	soup = getSoupByUrl(detailUrl)
	tables = soup.find_all('table',{'class':'table ta-c table2 table-white'})

	trs = tables[0].find_all('tr', recursive=False) #找到直接孩子
	for j in range(trs.__len__()):
		tds = trs[j].find_all('td')
		if tds.__len__() > 1:
			for i in range(tds.__len__()/2):	
				infoKey = tds[2*i].text.replace(' ', '').replace('\r', '').replace('\n', '')
				infoValue = tds[2*i+1].text.replace(' ', '').replace('\r', '').replace('\n', '')
				
				if infoValue.find('--') == -1:
					detailDict.update({infoKey : infoValue})

	buileDict.update({'info': detailDict})
	
	buildTable = tables[0].find('table')

	allRoomDict = []
	allStatusDict = []

	#获取楼盘所有楼栋的基本信息
	
	if (buildTable != None) :#没有有更多楼栋

		tableChild = tables[0].find_all('table',{'class':'table ta-c table2 table-white'})
		
		trs = tableChild[0].find_all('tr', recursive=False)
		for tr in trs:
			if tr.find_all('th').__len__() > 0:
				ths = tr.find_all('th')
				for it in ths:
					titleInfo.append(it.text.replace(' ', '').replace('\r', '').replace('\n', ''))
				continue
			
			if tr.find_all('td').__len__() > 0:
				tds = tr.find_all('td')
				index = 0

				itemInfo = collections.OrderedDict()
				for it in tds:
					aTag = it.find_all("a")

					itemInfo.update({titleInfo[index%titleInfo.__len__()] : it.text.replace(' ', '').replace('\r', '').replace('\n', '')})
					index = index + 1

				if aTag != None and aTag.__len__() > 0:
					href = aTag[0].get("href")
					print('-----------href')
					enterUrl = "http://zjj.sz.gov.cn/ris/bol/szfdc/" + href
					print(enterUrl)
					getAllRoom(name, itemInfo.get(list(itemInfo.keys())[1]), enterUrl, projectId, allRoomDict, allStatusDict)
				allItems.append(itemInfo)
			
			# for value in values:

			# infoText = info.text.encode('utf-8').replace('　', '')
			# infoText = unicode(infoText, "utf-8")

			# if info.find("a") != None:
			# 	url = "http://bjjs.zjw.beijing.gov.cn" + info.find("a").get("href")
			# 	getAllRoom(name, itemInfo.get(list(itemInfo.keys())[0]), url, projectId, allRoomDict, allStatusDict)

			# if info.find("strong") != None:	#表格的title 均为粗体, --批准销售套数 等内容
			# 	titleInfo.append(infoText)
			# else :
			# 	itemInfo.update({titleInfo[index%titleInfo.__len__()] : infoText})

			# if (itemInfo.__len__() > 0 and itemInfo.__len__() == titleInfo.__len__()) :
			# 	allItems.append(itemInfo)
			# 	itemInfo = collections.OrderedDict()
			# index = index + 1

	writeFile(allStatusDict, name + "_" + projectId + "_dy.json", False)#写入所有栋楼的所有房间信息
	writeFile(allRoomDict, name + "_" + projectId + ".json", False)

	buileDict.update({'build_list': allItems})

	isAppend = True
	if(indexTotal == 1) :
		isAppend = False
	writeFile(buileDict, "sz_" + timeStr + ".json", isAppend)

	return True

timeStr = str(long(time.time())/(24*60*60))
indexTotal = 0
startIndex = 0
endIndex = 1

#地区内所有楼盘内容
for page in range(0, 1):
	areaUrl = "http://zjj.sz.gov.cn/ris/bol/szfdc/index.aspx"
	soup = getSoupByUrl(areaUrl)

	infos = soup.find_all('table',{'class':'table ta-c bor-b-1 table-white'})[0].find_all('tr')
	lastUrl = ""

	for index in range(0, infos.__len__()):

		tags = infos[index].find_all("a")
		if tags != None and tags.__len__() > 0:
			url = "http://zjj.sz.gov.cn/ris/bol/szfdc/" + tags[0].get("href")
			url = url.replace('./', '')
			projectId = tags[0].text.replace(' ', '').replace('\r', '').replace('\n', '')
			name = tags[1].text.replace(' ', '').replace('\r', '').replace('\n', '')
			detailUrl = "http://zjj.sz.gov.cn/ris/bol/szfdc/" + tags[1].get("href")	
			getCertDetail(url, detailUrl, projectId, name)
			
			







