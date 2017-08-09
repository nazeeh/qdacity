package com.qdacity.project.metrics.algorithms.datastructures.converter;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;

import com.google.appengine.api.datastore.Text;
import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.EvaluationUnit;
import com.qdacity.project.metrics.algorithms.KrippendorffsAlphaCoefficient;
import com.qdacity.project.metrics.algorithms.datastructures.ReliabilityData;
import com.qdacity.project.metrics.algorithms.datastructures.converter.ReliabilityDataGenerator;

public class ReliabilityDataGeneratorTest {

    ReliabilityDataGenerator generator;
    List<TextDocument> textDocuments;
    List<Long> codeIds;
    List<ReliabilityData> reliabilityData_SOLUTION;

    String htmlString = "<html><body contenteditable=\"false\"><div id=\"svgContainer\" class=\"svgContainer\"><svg width=\"170\" height=\"951\"><svg id=\"bracket_69\" class=\"codingBracket\" coding_id=\"69\"><path id=\"path_69\" d=\"M150,14L142,14L142,29L150,29\" stroke=\"#000000\" style=\"stroke=#000000\" fill=\"none\" coding_id=\"69\"></path><text id=\"label_69\" x=\"134\" y=\"25.5\" style=\"text-anchor: end; fill:#000000;\" coding_id=\"69\">A</text></svg><svg id=\"bracket_70\" class=\"codingBracket\" coding_id=\"70\"><path id=\"path_70\" d=\"M150,44L142,44L142,59L150,59\" stroke=\"#000000\" style=\"stroke=#000000\" fill=\"none\" coding_id=\"70\"></path><text id=\"label_70\" x=\"134\" y=\"55.5\" style=\"text-anchor: end; fill:#000000;\" coding_id=\"70\">B</text></svg><svg id=\"bracket_73\" class=\"codingBracket\" coding_id=\"73\"><path id=\"path_73\" d=\"M150,74L142,74L142,89L150,89\" stroke=\"#000000\" style=\"stroke=#000000\" fill=\"none\" coding_id=\"73\"></path><text id=\"label_73\" x=\"134\" y=\"85.5\" style=\"text-anchor: end; fill:#000000;\" coding_id=\"73\">C</text></svg><svg id=\"bracket_74\" class=\"codingBracket\" coding_id=\"74\"><path id=\"path_74\" d=\"M150,104L142,104L142,119L150,119\" stroke=\"#76923c\" style=\"stroke=#76923c\" fill=\"none\" coding_id=\"74\"></path><text id=\"label_74\" x=\"134\" y=\"115.5\" style=\"text-anchor: end; fill:#76923c;\" coding_id=\"74\">D</text></svg><svg id=\"bracket_75\" class=\"codingBracket\" coding_id=\"75\"><path id=\"path_75\" d=\"M150,134L142,134L142,149L150,149\" stroke=\"#000000\" style=\"stroke=#000000\" fill=\"none\" coding_id=\"75\"></path><text id=\"label_75\" x=\"134\" y=\"145.5\" style=\"text-anchor: end; fill:#000000;\" coding_id=\"75\">A</text></svg><svg id=\"bracket_76\" class=\"codingBracket\" coding_id=\"76\"><path id=\"path_76\" d=\"M150,164L142,164L142,179L150,179\" stroke=\"#000000\" style=\"stroke=#000000\" fill=\"none\" coding_id=\"76\"></path><text id=\"label_76\" x=\"134\" y=\"175.5\" style=\"text-anchor: end; fill:#000000;\" coding_id=\"76\">B</text></svg></svg></div><p class=\"paragraph\"><coding id=\"69\" code_id=\"33\" author=\"Matthias Schöpe\" class=\"tooltipsss\" codename=\"A\" title=\"A\" data-toggle=\"tooltip\" data-placement=\"bottom\">This is an example</coding><br></p><p class=\"paragraph\"><coding id=\"70\" code_id=\"34\" author=\"Matthias Schöpe\" class=\"tooltipsss\" codename=\"B\" title=\"B\" data-toggle=\"tooltip\" data-placement=\"bottom\">Only made for the JUnit Test</coding><br></p><p class=\"paragraph\"><coding id=\"73\" code_id=\"35\" author=\"Matthias Schöpe\" class=\"tooltipsss\" codename=\"C\" title=\"C\" data-toggle=\"tooltip\" data-placement=\"bottom\">ReliabilityDataGenerator Test. Manually created</coding><br></p><p class=\"paragraph\"><coding id=\"74\" code_id=\"6\" author=\"Matthias Schöpe\" class=\"tooltipsss\" codename=\"D\" title=\"D\" data-toggle=\"tooltip\" data-placement=\"bottom\">Hope it is easy to see how this test works</coding><br></p><p class=\"paragraph\"><coding id=\"75\" code_id=\"33\" author=\"Matthias Schöpe\" class=\"tooltipsss\" codename=\"A\" title=\"A\" data-toggle=\"tooltip\" data-placement=\"bottom\">Have a nice day!</coding><br></p><p class=\"paragraph\"><coding id=\"76\" code_id=\"34\" author=\"Matthias Schöpe\" class=\"tooltipsss\" codename=\"B\" title=\"B\" data-toggle=\"tooltip\" data-placement=\"bottom\">Cheers!</coding></p></body></html>";
    String htmlString2 = "<html><body contenteditable=\"false\"><div id=\"svgContainer\" class=\"svgContainer\"><svg width=\"170\" height=\"951\"><svg id=\"bracket_1\" class=\"codingBracket\" coding_id=\"1\"><path id=\"path_1\" d=\"M150,14L142,14L142,29L150,29\" stroke=\"#000000\" style=\"stroke=#000000\" fill=\"none\" coding_id=\"1\"></path><text id=\"label_1\" x=\"134\" y=\"25.5\" style=\"text-anchor: end; fill:#000000;\" coding_id=\"1\">A</text></svg><svg id=\"bracket_2\" class=\"codingBracket\" coding_id=\"2\"><path id=\"path_2\" d=\"M150,44L142,44L142,59L150,59\" stroke=\"#000000\" style=\"stroke=#000000\" fill=\"none\" coding_id=\"2\"></path><text id=\"label_2\" x=\"134\" y=\"55.5\" style=\"text-anchor: end; fill:#000000;\" coding_id=\"2\">B</text></svg><svg id=\"bracket_3\" class=\"codingBracket\" coding_id=\"3\"><path id=\"path_3\" d=\"M150,74L142,74L142,89L150,89\" stroke=\"#76923c\" style=\"stroke=#76923c\" fill=\"none\" coding_id=\"3\"></path><text id=\"label_3\" x=\"134\" y=\"85.5\" style=\"text-anchor: end; fill:#76923c;\" coding_id=\"3\">D</text></svg><svg id=\"bracket_4\" class=\"codingBracket\" coding_id=\"4\"><path id=\"path_4\" d=\"M150,104L142,104L142,119L150,119\" stroke=\"#000000\" style=\"stroke=#000000\" fill=\"none\" coding_id=\"4\"></path><text id=\"label_4\" x=\"134\" y=\"115.5\" style=\"text-anchor: end; fill:#000000;\" coding_id=\"4\">C</text></svg><svg id=\"bracket_5\" class=\"codingBracket\" coding_id=\"5\"><path id=\"path_5\" d=\"M150,134L142,134L142,149L150,149\" stroke=\"#000000\" style=\"stroke=#000000\" fill=\"none\" coding_id=\"5\"></path><text id=\"label_5\" x=\"134\" y=\"145.5\" style=\"text-anchor: end; fill:#000000;\" coding_id=\"5\">B</text></svg><svg id=\"bracket_6\" class=\"codingBracket\" coding_id=\"6\"><path id=\"path_6\" d=\"M150,164L142,164L142,179L150,179\" stroke=\"#000000\" style=\"stroke=#000000\" fill=\"none\" coding_id=\"6\"></path><text id=\"label_6\" x=\"134\" y=\"175.5\" style=\"text-anchor: end; fill:#000000;\" coding_id=\"6\">A</text></svg></svg></div><p class=\"paragraph\"><coding id=\"1\" code_id=\"33\" author=\"Matthias Schöpe\" class=\"tooltipsss\" codename=\"A\" title=\"A\" data-toggle=\"tooltip\" data-placement=\"bottom\">This is an example</coding><br></p><p class=\"paragraph\"><coding id=\"2\" code_id=\"34\" author=\"Matthias Schöpe\" class=\"tooltipsss\" codename=\"B\" title=\"B\" data-toggle=\"tooltip\" data-placement=\"bottom\">Only made for the JUnit Test</coding><br></p><p class=\"paragraph\"><coding id=\"3\" code_id=\"6\" author=\"Matthias Schöpe\" class=\"tooltipsss\" codename=\"D\" title=\"D\" data-toggle=\"tooltip\" data-placement=\"bottom\">ReliabilityDataGenerator Test. Manually created</coding><br></p><p class=\"paragraph\"><coding id=\"4\" code_id=\"35\" author=\"Matthias Schöpe\" class=\"tooltipsss\" codename=\"C\" title=\"C\" data-toggle=\"tooltip\" data-placement=\"bottom\">Hope it is easy to see how this test works</coding><br></p><p class=\"paragraph\"><coding id=\"5\" code_id=\"34\" author=\"Matthias Schöpe\" class=\"tooltipsss\" codename=\"B\" title=\"B\" data-toggle=\"tooltip\" data-placement=\"bottom\">Have a nice day!</coding><br></p><p class=\"paragraph\"><coding id=\"6\" code_id=\"33\" author=\"Matthias Schöpe\" class=\"tooltipsss\" codename=\"A\" title=\"A\" data-toggle=\"tooltip\" data-placement=\"bottom\">Cheers!</coding><br></p></body></html>";

    @Before
    public void init() {
	textDocuments = new ArrayList<>();

	TextDocument txt = new TextDocument();
	TextDocument txt2 = new TextDocument();
	txt.setText(new Text(htmlString));
	txt2.setText(new Text(htmlString2));
	textDocuments.add(txt);
	textDocuments.add(txt2);

	codeIds = new ArrayList<>();
	codeIds.add(33L);
	codeIds.add(34L);
	codeIds.add(6L);
	codeIds.add(35L);

	reliabilityData_SOLUTION = new ArrayList<>();
	ReliabilityData rData1 = new ReliabilityData(6, 2);
	rData1.set(1, 1, 2);
	rData1.set(2, 1, 1);
	rData1.set(3, 1, 1);
	rData1.set(4, 1, 1);
	rData1.set(5, 1, 2);
	rData1.set(6, 1, 1);
	rData1.set(1, 2, 2);
	rData1.set(2, 2, 1);
	rData1.set(3, 2, 1);
	rData1.set(4, 2, 1);
	rData1.set(5, 2, 1);
	rData1.set(6, 2, 2);
	ReliabilityData rData2 = new ReliabilityData(6, 2);
	rData2.set(1, 1, 1);
	rData2.set(2, 1, 2);
	rData2.set(3, 1, 1);
	rData2.set(4, 1, 1);
	rData2.set(5, 1, 1);
	rData2.set(6, 1, 2);
	rData2.set(1, 2, 1);
	rData2.set(2, 2, 2);
	rData2.set(3, 2, 1);
	rData2.set(4, 2, 1);
	rData2.set(5, 2, 2);
	rData2.set(6, 2, 1);
	ReliabilityData rData3 = new ReliabilityData(6, 2);
	rData3.set(1, 1, 1);
	rData3.set(2, 1, 1);
	rData3.set(3, 1, 1);
	rData3.set(4, 1, 2);
	rData3.set(5, 1, 1);
	rData3.set(6, 1, 1);
	rData3.set(1, 2, 1);
	rData3.set(2, 2, 1);
	rData3.set(3, 2, 2);
	rData3.set(4, 2, 1);
	rData3.set(5, 2, 1);
	rData3.set(6, 2, 1);
	ReliabilityData rData4 = new ReliabilityData(6, 2);
	rData4.set(1, 1, 1);
	rData4.set(2, 1, 1);
	rData4.set(3, 1, 2);
	rData4.set(4, 1, 1);
	rData4.set(5, 1, 1);
	rData4.set(6, 1, 1);
	rData4.set(1, 2, 1);
	rData4.set(2, 2, 1);
	rData4.set(3, 2, 1);
	rData4.set(4, 2, 2);
	rData4.set(5, 2, 1);
	rData4.set(6, 2, 1);

	reliabilityData_SOLUTION.add(rData1);
	reliabilityData_SOLUTION.add(rData2);
	reliabilityData_SOLUTION.add(rData3);
	reliabilityData_SOLUTION.add(rData4);
	generator = new ReliabilityDataGenerator(textDocuments, codeIds, EvaluationUnit.PARAGRAPH);
    }

    //@Ignore
    @Test
    public void test() {
	List<ReliabilityData> rDataList = generator.generate();

	int rDataIdx = 0;
	for (ReliabilityData rData : rDataList) {
	    assert (rData.equals(reliabilityData_SOLUTION.get(rDataIdx++)));
	    Logger.getLogger("logger").log(Level.INFO, "ALPHA: "+new KrippendorffsAlphaCoefficient(rData, 2).compute());
	}
    }
}
