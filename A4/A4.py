"""
15:05 Montag, 10. Juli 2017 (MESZ) 
@author: JSey 3603466
"""


import json
import matplotlib.pyplot as plt
import numpy as np
import argparse


# #--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##
# Viterbi Algorithmus
# #--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##


def viterbi(sequenz, zustaende, zustaende_wsl, uebergangs_wsl, emmisions_wsl, reverse_loop):
    print 'sequenz :'
    print sequenz
    print 'Zustaende :'
    print zustaende
    print 'StartWsl :'
    print zustaende_wsl
    print 'UebergangsWsl :'
    print uebergangs_wsl
    print 'EmmisionsWsl :'
    print emmisions_wsl

    viterbi_list = [{}]
    opt_wsl = []
    j = 0

    for zustand in zustaende:
        viterbi_list[0][zustand] = {"Wahrscheinlichkeit": np.float128(zustaende_wsl[zustand] * emmisions_wsl[zustand][sequenz[0]]), "vorher": None, "Index": j}

    if(reverse_loop):
        zustaende = list(reversed(zustaende))

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
    for k in range(len(viterbi_list) - 2, -1, -1):
        opt_wsl.insert(0, viterbi_list[k + 1][previous]["vorher"])
        previous = viterbi_list[k + 1][previous]["vorher"]

    print 'Viterbi-List :'
    for line in viterbi_list:
        print str(line)

    print ' \n Die Abfolge der Zustaende ist \n '+' '.join(opt_wsl) + '\n mit der hoehsten Wahrscheinlichkeit von %s' % max_wsl + '\n'

    return viterbi_list

"""
def printViterbiList(viterbi_list):
    print 'Viterbi-List :'
    for zustand in viterbi_list[0]:
        print zustand + " ".join('\n' + str(viterbi_item[zustand]["Index"]) + ' ' + str(viterbi_item[zustand]["Wahrscheinlichkeit"]) for viterbi_item in viterbi_list)
"""

# #--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##
# Forward 
# #--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##


def forward(sequenz, zustaende, zustaende_wsl, uebergangs_wsl, emmisions_wsl):
    print 'sequenz :'
    print sequenz
    print 'Zustaende :'
    print zustaende
    print 'StartWsl :'
    print zustaende_wsl
    print 'UebergangsWsl :'
    print uebergangs_wsl
    print 'EmmisionsWsl :'
    print emmisions_wsl

    forward_list = []
    forward_vorher = {}
    for i, observation_i in enumerate(sequenz):
        forward_current = {}
        for zustand in zustaende:
            if i == 0:
                # base case for the forward part
                forward_vorher_sum = zustaende_wsl[zustand]
            else:
                forward_vorher_sum = sum(forward_vorher[k]*uebergangs_wsl[k][zustand] for k in zustaende)

            forward_current[zustand] = emmisions_wsl[zustand][observation_i] * forward_vorher_sum
        
        forward_list.append(forward_current)
        forward_vorher = forward_current

    print 'Vorwaerts-List :'
    for forward_item in forward_list:
        print str(forward_list.index(forward_item)) + ':-->' + str(forward_item)

    return forward_list

"""
def toStringTest(viterbi_list):
    for zustand in viterbi_list[0]:
            yield "%.20s: " % zustand + " ".join("%.20s" % ("%f" % viterbi_item[zustand]["Wahrscheinlichkeit"]) for viterbi_item in viterbi_list)
"""


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


def getSequenz(result_data, name, reverse):
    arr = []
    test_str = ''
    for line in result_data:
        arr = line.split()

        if (arr[0] == name):
            # Expertiment Sequenz herumdrehen 
            if(reverse): 
                return list(reversed_string(str(arr[1])))
            else:
                return list(arr[1])
           

def getZustaende(arr):
    zstd_arr = []

    for zstd in arr:
        zstd_arr.append(zstd)

    return zstd_arr


def reversed_string(a_string):
    return a_string[::-1]


# #--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##
# Skala Funktionen
# #--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##
def buildViterbiScala(viterbi_list, plot):
    y_1_arr = []
    y_2_arr = []
    x_1_arr = []
    x_2_arr = []

    for viterbi_item in viterbi_list:
        y_1_arr.append(viterbi_item['F']['Wahrscheinlichkeit'])
        x_1_arr.append(viterbi_item['F']['Index'])

        y_2_arr.append(viterbi_item['L']['Wahrscheinlichkeit'])
        x_2_arr.append(viterbi_item['L']['Index'])

    fig, ax = plt.subplots()

    if plot == 'l':
        ax.set_yscale('log')

    if plot == 'l' or plot == 'n':
        ax.plot(x_1_arr, y_1_arr, '#7eb283', label='ungezinkt')
        ax.plot(x_2_arr, y_2_arr, '#d1252b', label='gezinkt')

        legend = ax.legend(loc='upper center', shadow=True, fontsize='x-large')
        legend.get_frame().set_facecolor('#FFFFFF')

        plt.show()


def buildForwardScala(forward_list, plot):
    y_1_arr = []
    y_2_arr = []
    x_1_arr = []
    x_2_arr = []

    for forward_item in forward_list:
        y_1_arr.append(forward_item['F'])
        x_1_arr.append(forward_list.index(forward_item))

        y_2_arr.append(forward_item['L'])
        x_2_arr.append(forward_list.index(forward_item))

    fig, ax = plt.subplots()

    if plot == 'l':
        ax.set_yscale('log')

    if plot == 'l' or plot == 'n':
        ax.plot(x_1_arr, y_1_arr, '#7eb283', label='ungezinkt')
        ax.plot(x_2_arr, y_2_arr, '#d1252b', label='gezinkt')

        legend = ax.legend(loc='upper center', shadow=True, fontsize='x-large')
        legend.get_frame().set_facecolor('#FFFFFF')

        plt.show()


# #--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##
# Kommandozeilen-Args
# #--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##--##

__parser__ = argparse.ArgumentParser(
    description="Forwards/Viterbi Algorithmus mit Skala plot.(Backwards wurde nicht benoetigt) \n" +
                "Example: Viterbi Algorithm + Plot Log : python A4_2.py -a vit -p l")

__parser__.add_argument(
    "-f",
    "--file",
    type=str,
    required=True,
    help="Text Datei mit Zahlenfolge \n" + 
         "Bsp.: -f wuerfel.txt")

__parser__.add_argument(
    "-a",
    "--algorithmus",
    type=str,
    required=True,
    help=" Viterbi-Alg == '"'vit'"' oder '"'Viterbi'"'. \n " +
         " Vorwaerts-Alg == '"'vor'"' oder '"'Vorwaerts'"'. \n " + 
         "Bsp.: -a vit  oder -a vor")

__parser__.add_argument(
    "-p",
    "--plot",
    type=str,
    required=False,
    help="Soll eine Skale erstellt werden ? \n" + 
         "(l = logarithmische Skala) ||p (p= normale Skala)"
         "Bsp.: -p l  oder -p n")

__parser__.add_argument(
    "-rs",
    "--reverse_Sequenz",
    type=str,
    required=False,
    help="Soll die Reihenfolge der Zeichen der Eingabesequenz vertauscht werden (y/n)? \n" + 
         "Bsp.: -rs y  oder -rs n")

__parser__.add_argument(
    "-rl",
    "--reverse_Loop",
    type=str,
    required=False,
    help="Soll Reihenfolge der Zustaende vertauscht werden (y/n)? \n" + 
         "Bsp.: -rl y oder -rl n")


# Parsen der Kommandozeilen-Args
if __name__ == '__main__':
    __args__ = __parser__.parse_args()

    __algorithmus__ = __args__.algorithmus
    __plot__ = __args__.plot

    __result_data__ = readTxtFile(__args__.file)
    __wsl__ = readJsonFile('wsl_wuerfel.json')

    __zustaende_wsl__ = __wsl__['Zustaende']
    __uebergangs_wsl__ = __wsl__['UebergangsWsl']
    __emmisions_wsl__ = __wsl__['EmmisionsWsl']

    if __args__.reverse_Sequenz == 'y':
        __rs__ = True
    else:
        __rs__ = False

    if __args__.reverse_Loop == 'y':
        __rl__ = True
    else:
        __rl__ = False

    __sequenz__ = getSequenz(__result_data__, 'zahlenfolge', __rs__)
    __zustaende__ = getZustaende(__zustaende_wsl__)

    if __algorithmus__ == 'vit' or __algorithmus__ == 'Viterbi':
        viterbi_list = viterbi(__sequenz__, __zustaende__, __zustaende_wsl__, __uebergangs_wsl__, __emmisions_wsl__, __rl__)
        buildViterbiScala(viterbi_list, __plot__)
    elif __algorithmus__ == 'vor' or __algorithmus__ == 'Vorwaerts':
        forward_list = forward(__sequenz__, __zustaende__, __zustaende_wsl__, __uebergangs_wsl__, __emmisions_wsl__)
        buildForwardScala(forward_list, __plot__)
    else:
        print 'Err: algorithm not found'
