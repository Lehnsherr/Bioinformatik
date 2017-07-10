"""
15:05 Montag, 10. Juli 2017 (MESZ) 
@author: JSey 3603466
"""


import json
import Tkinter as tk
import matplotlib.pyplot as plt
import matplotlib as mpl
import numpy as np
import argparse

faktor = 1


def viterbi(sequenz, zustaende, zustaende_wsl, uebergangs_wsl, emmisions_wsl, plot):
    viterbi_list = [{}]
    opt_wsl = []
    opt_wsl_str = ""
    j = 0
    max_wsl = 0

    for zustand in zustaende:
        viterbi_list[0][zustand] = {"Wahrscheinlichkeit": np.float128((zustaende_wsl[zustand] * emmisions_wsl[zustand][sequenz[0]])*faktor), "vorher": None, "Index": j}

    for i in range(1, len(sequenz)):

        viterbi_list.append({})

        for zustand in zustaende:
            max_uebergangs_wsl = max(
                np.float128(viterbi_list[i-1][vorher_zustand]["Wahrscheinlichkeit"]*uebergangs_wsl[vorher_zustand][zustand]) for vorher_zustand in zustaende
            )

            for vorher_zustand in zustaende:
                if viterbi_list[i-1][vorher_zustand]["Wahrscheinlichkeit"] * uebergangs_wsl[vorher_zustand][zustand] == max_uebergangs_wsl:
                    
                    max_wsl = np.float128(max_uebergangs_wsl * emmisions_wsl[zustand][sequenz[i]])
                    viterbi_list[i][zustand] = {"Wahrscheinlichkeit": max_wsl, "vorher": vorher_zustand, "Index": i}

                    break

    for line in dptable(viterbi_list):
        print line

    # Hoehste Wahrscheinlichkeit berechnen
    max_wsl = max(value["Wahrscheinlichkeit"] for value in viterbi_list[-1].values())

    previous = None

    # Hoehste Wahrscheinlicher Zustand und seine Zurueckverfolgung
    for zustand, data in viterbi_list[-1].items():
        if data["Wahrscheinlichkeit"] == max_wsl:
            opt_wsl.append(zustand)

            previous = zustand

            break

    # Pfad zurueck verfolgen bis zur ersten Begegnung
    for i in range(len(viterbi_list) - 2, -1, -1):
        opt_wsl.insert(0, viterbi_list[i + 1][previous]["vorher"])
        previous = viterbi_list[i + 1][previous]["vorher"]

    opt_wsl_str = toStringMaxWsl(viterbi_list, previous)

    # print ' \n Die Abfolge der Zustaende ist \n '+' '.join(opt_wsl) + '\n mit der hoehsten Wahrscheinlichkeit von %s' % max_wsl + '\n'
    print ' \n Die Abfolge der Zustaende ist \n '+ opt_wsl_str + '\n mit der hoehsten Wahrscheinlichkeit von %s' % max_wsl + '\n'

    # for line in viterbi_list:
    #     print str(line) + '\n'

    buildScala(viterbi_list, plot)


def toStringMaxWsl(viterbi_list, previous):
    opt_to_string = ''
    for i in range(len(viterbi_list) - 2, -1, -1):
        previous = viterbi_list[i + 1][previous]["vorher"]

        if previous == 'ungezinkt':
            previous_str = 'F'
        elif previous == 'gezinkt':
            previous_str = 'L'

        opt_to_string = opt_to_string + previous_str

    return opt_to_string


def toStringTest(viterbi_list):
    for zustand in viterbi_list[0]:
            yield "%.20s: " % zustand + " ".join("%.20s" % ("%f" % viterbi_item[zustand]["Wahrscheinlichkeit"]) for viterbi_item in viterbi_list)


def dptable(viterbi_list):
    for zustand in viterbi_list[0]:
        # yield zustand + " ".join('\n' + str(viterbi_item[zustand]["Wahrscheinlichkeit"]) for viterbi_item in viterbi_list)
        # yield "%.20s: " % zustand + " ".join("%.20s" % ("%f" % viterbi_item[zustand]["Wahrscheinlichkeit"]) for viterbi_item in viterbi_list)
        yield zustand + " ".join('\n' + str(viterbi_item[zustand]["Index"]) + ' ' + str(viterbi_item[zustand]["Wahrscheinlichkeit"]) for viterbi_item in viterbi_list)


def readTxtFile(file_name):
    arr = []
    with open(file_name) as f:
        for line in f:
            arr.append(line)

    return arr


def readJsonFile(file_name):
    with open(file_name) as json_data:
        j_data = json.load(json_data)

    return j_data


def getSequenz(result_data, name):
    arr = []
    test_str = ''
    for line in result_data:
        arr = line.split()

        if (arr[0] == name):
            # Expertiment Sequenz herumdrehen 
            return list(reversed_string(str(arr[1])))
            # return list(arr[1])


def getZustaende(arr):
    zstd_arr = []

    for zstd in arr:
        zstd_arr.append(zstd)

    return zstd_arr


def reversed_string(a_string):
    return a_string[::-1]
    # return a_string.join(reversed(a_string))


def buildScala(viterbi_list, plot):
    y_1_arr = []
    y_2_arr = []
    x_1_arr = []
    x_2_arr = []

    for viterbi_item in viterbi_list:
        y_1_arr.append(viterbi_item['ungezinkt']['Wahrscheinlichkeit'])
        x_1_arr.append(viterbi_item['ungezinkt']['Index'])

        y_2_arr.append(viterbi_item['gezinkt']['Wahrscheinlichkeit'])
        x_2_arr.append(viterbi_item['gezinkt']['Index'])

    fig, ax = plt.subplots()

    if plot == 'l':
        ax.set_yscale('log')
    
    if plot == 'l' or plot == 'n':
        ax.plot(x_1_arr, y_1_arr, '#7eb283', label='ungezinkt')
        ax.plot(x_2_arr, y_2_arr, '#d1252b', label='gezinkt')

        legend = ax.legend(loc='upper center', shadow=True, fontsize='x-large')
        legend.get_frame().set_facecolor('#FFFFFF')
  
        plt.show()



##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##
# Kommandozeilen-Args
##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##

__parser__ = argparse.ArgumentParser(
    description="Viterbi Algorithmus mit Skala plot.")

__parser__.add_argument(
    "-p",
    "--plot",
    type=str,
    required=False,
    help="l(= logarithmische Skala) || n (= normale Skala)")

# Parsen der Kommandozeilen-Args
if __name__ == '__main__':
    __args__ = __parser__.parse_args()

    __plot__ = __args__.plot

    __result_data__ = readTxtFile('wuerfel.txt')

    __wsl__ = readJsonFile('wsl_wuerfel.json')

    __zustaende_wsl__ = __wsl__['Zustaende']
    __uebergangs_wsl__ = __wsl__['Uebergangs']
    __emmisions_wsl__ = __wsl__['Emmisionswsl']

    __sequenz__ = getSequenz(__result_data__, 'zahlenfolge')
    __zustaende__ = getZustaende(__zustaende_wsl__)

    print(__sequenz__)
    print(__zustaende__)
    print(__zustaende_wsl__)
    print(__uebergangs_wsl__)
    print(__emmisions_wsl__)

    viterbi(__sequenz__, __zustaende__, __zustaende_wsl__, __uebergangs_wsl__, __emmisions_wsl__, __plot__)
