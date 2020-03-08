#!/usr/local/bin/python
#coding=utf-8

import urllib2
from bs4 import BeautifulSoup
import csv
import json

class Room(object):
	def __init__(self, number, in_square, out_square):
		self.number = number
		self.in_square = in_square
		self.out_square = out_square

def obj_2_json(obj):
	return {
		'number':obj.number,
		'in_square':obj.in_square,
		'out_square':obj.out_square
	}
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

#写入乱码问题
def writeCsv(x):
	with open('data.csv', 'ab+') as csvfile:
		writer = csv.writer(csvfile, dialect='excel')
		writer.writerow(x)

def writeJson(data, fileName):

	# str = json.dumps(data)
	# result = str.decode("unicode-escape").decode("unicode-escape")

	with open(fileName, 'ab+') as f:
		json.dump(data, f)
		f.write('\n')

    # with open("data.txt", "w") as f:
    # 	f.write(json.dumps(data, ensure_ascii=False))

def getItem(name, url):
	print (url)

	soup = getSoupByUrl(url)
	desc = soup.find_all(id='desc')

	if desc.__len__() > 13:
		room = Room(desc[1].text.split(' ')[0], desc[7].text.split(' ')[0], desc[9].text.split(' ')[0])
		roomJson = json.dumps(room, default = obj_2_json, ensure_ascii=False)
		writeJson(roomJson, name + ".json")
	else:
		print("length error:" + str(len(desc)))

def getAllRoom(name, url):
	soup = getSoupByUrl(url)

	tables = soup.find_all(id="table_Buileing")
	alldivs = tables[0].find_all("div")

	for i in alldivs:
		print ("------------------")
		style = i.get("style")

		print(style.split(";")[1])
		link = i.find("a")
		print(link.text)
		print(link.get("href"))
		href = "http://bjjs.zjw.beijing.gov.cn" + link.get("href")
		getItem(name, href)
		print ("------------------")

	print(alldivs.__len__())

def getProjectInfo(url):
	soup = getSoupByUrl(url)
	rowInfo = []
	# soup.find(attrs={"class":"cont_titlebg"})
	projectName = soup.find_all(id="newslist")[0].find_all("td")[1].text #TODO 存在空格
	print(projectName)
	infos = table = soup.find_all(id="Span1")[0].find_all("table")[0].find_all("td")
	for info in infos:
		if info.find("a") != None:
			url = "http://bjjs.zjw.beijing.gov.cn" + info.find("a").get("href")
			print(url)
			# getAllRoom(rowInfo[0], url)
		print(info.text)
		rowInfo.append(info.text)
		if rowInfo.__len__() == 6:#每6项是一行
			writeJson(rowInfo, projectName + ".json")
			rowInfo = []
	print(rowInfo)

for page in range(10):

	beijingUrl = "http://bjjs.zjw.beijing.gov.cn/eportal/ui?pageId=307678&isTrue=&currentPage=" + str(page) + "&pageSize=15"
	soup = getSoupByUrl(beijingUrl)

	infos = soup.find_all("form")[1].find_all("table")[6].find_all("td")
	for index in range(infos.__len__()):
		print(index)
		tag = infos[index].find("a")
		if tag != None:
			rowInfo = []
			url = "http://bjjs.zjw.beijing.gov.cn" + tag.get("href")
			print(url)
			# getProjectInfo(url)
			fileName = tag.text
			print(fileName)
			rowInfo.append(fileName)
			rowInfo.append(url)
			writeJson(rowInfo, "beijing.json") #多了一条0数据








