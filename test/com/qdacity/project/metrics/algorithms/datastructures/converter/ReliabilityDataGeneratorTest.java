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

    String htmlString = "<html><head><title>test</title><link href=\"assets/css/editorView.css\" rel=\"stylesheet\"><link href=\"assets/css/codingBrackets.css\" rel=\"stylesheet\"></head><body contenteditable=\"false\"><div id=\"svgContainer\" class=\"svgContainer\"><svg width=\"150\" height=\"923\"><svg id=\"bracket_9\" class=\"codingBracket\" coding_id=\"9\"><path id=\"path_9\" d=\"M130,44L122,44L122,110L130,110\" stroke=\"#000000\" style=\"stroke=#000000\" fill=\"none\" coding_id=\"9\"></path><text id=\"label_9\" x=\"114\" y=\"81\" style=\"text-anchor: end; fill:#000000;\" coding_id=\"9\">A</text></svg><svg id=\"bracket_10\" class=\"codingBracket\" coding_id=\"10\"><path id=\"path_10\" d=\"M130,185L122,185L122,268L130,268\" stroke=\"#000000\" style=\"stroke=#000000\" fill=\"none\" coding_id=\"10\"></path><text id=\"label_10\" x=\"114\" y=\"230.5\" style=\"text-anchor: end; fill:#000000;\" coding_id=\"10\">B</text></svg><svg id=\"bracket_11\" class=\"codingBracket\" coding_id=\"11\"><path id=\"path_11\" d=\"M130,343L122,343L122,443L130,443\" stroke=\"#000000\" style=\"stroke=#000000\" fill=\"none\" coding_id=\"11\"></path><text id=\"label_11\" x=\"114\" y=\"397\" style=\"text-anchor: end; fill:#000000;\" coding_id=\"11\">C</text></svg><svg id=\"bracket_12\" class=\"codingBracket\" coding_id=\"12\"><path id=\"path_12\" d=\"M130,552L122,552L122,652L130,652\" stroke=\"#000000\" style=\"stroke=#000000\" fill=\"none\" coding_id=\"12\"></path><text id=\"label_12\" x=\"114\" y=\"606\" style=\"text-anchor: end; fill:#000000;\" coding_id=\"12\">D</text></svg><svg id=\"bracket_13\" class=\"codingBracket\" coding_id=\"13\"><path id=\"path_13\" d=\"M130,458L122,458L122,507L130,507\" stroke=\"#000000\" style=\"stroke=#000000\" fill=\"none\" coding_id=\"13\"></path><text id=\"label_13\" x=\"114\" y=\"486.5\" style=\"text-anchor: end; fill:#000000;\" coding_id=\"13\">A</text></svg></svg></div><p><b>What is Lorem Ipsum?</b><br></p><p><b><b><coding id=\"9\" code_id=\"4\" author=\"Matthias Sch�pe\" class=\"tooltipsss\" codename=\"A\" title=\"A\" data-toggle=\"tooltip\" data-placement=\"bottom\">Lorem Ipsum</coding></b><coding id=\"9\" code_id=\"4\" author=\"Matthias Sch�pe\" class=\"tooltipsss\" codename=\"A\" title=\"A\" data-toggle=\"tooltip\" data-placement=\"bottom\"> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</coding></b><br></p><p class=\"paragraph\"><b></b><br></p><p><b><b>Why do we use it?</b></b><br></p><p><b><b><coding id=\"10\" code_id=\"5\" author=\"Matthias Sch�pe\" class=\"tooltipsss\" codename=\"B\" title=\"B\" data-toggle=\"tooltip\" data-placement=\"bottom\">It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</coding></b></b><br></p><p class=\"paragraph\"><b><b><p><br></p><p><b>Where does it come from?</b><br></p><p><b><coding id=\"11\" code_id=\"6\" author=\"Matthias Sch�pe\" class=\"tooltipsss\" codename=\"C\" title=\"C\" data-toggle=\"tooltip\" data-placement=\"bottom\">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of \"de Finibus Bonorum et Malorum\" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, \"Lorem ipsum dolor sit amet..\", comes from a line in section 1.10.32.</coding></b><br></p><b><p><coding id=\"13\" code_id=\"4\" author=\"Matthias Sch�pe\" class=\"tooltipsss\" codename=\"A\" title=\"A\" data-toggle=\"tooltip\" data-placement=\"bottom\">The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from \"de Finibus Bonorum et Malorum\" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</coding><br></p><p><b>Where can I get some?</b><br></p><p><b><coding id=\"12\" code_id=\"7\" author=\"Matthias Sch�pe\" class=\"tooltipsss\" codename=\"D\" title=\"D\" data-toggle=\"tooltip\" data-placement=\"bottom\">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.</coding></b><br></p><b><p><br></p><p><br></p></b></b></b></b><br></p><p><br></p></body></html>";
    String htmlString2 = "<html><head><title>test</title><link href=\"assets/css/editorView.css\" rel=\"stylesheet\"><link href=\"assets/css/codingBrackets.css\" rel=\"stylesheet\"></head><body contenteditable=\"false\"><div id=\"svgContainer\" class=\"svgContainer\"><svg width=\"150\" height=\"923\"><svg id=\"bracket_1\" class=\"codingBracket\" coding_id=\"1\"><path id=\"path_1\" d=\"M130,44L122,44L122,110L130,110\" stroke=\"#000000\" style=\"stroke=#000000\" fill=\"none\" coding_id=\"1\"></path><text id=\"label_1\" x=\"114\" y=\"81\" style=\"text-anchor: end; fill:#000000;\" coding_id=\"1\">A</text></svg><svg id=\"bracket_2\" class=\"codingBracket\" coding_id=\"2\"><path id=\"path_2\" d=\"M130,185L122,185L122,268L130,268\" stroke=\"#000000\" style=\"stroke=#000000\" fill=\"none\" coding_id=\"2\"></path><text id=\"label_2\" x=\"114\" y=\"230.5\" style=\"text-anchor: end; fill:#000000;\" coding_id=\"2\">B</text></svg><svg id=\"bracket_3\" class=\"codingBracket\" coding_id=\"3\"><path id=\"path_3\" d=\"M130,373L122,373L122,473L130,473\" stroke=\"#000000\" style=\"stroke=#000000\" fill=\"none\" coding_id=\"3\"></path><text id=\"label_3\" x=\"114\" y=\"427\" style=\"text-anchor: end; fill:#000000;\" coding_id=\"3\">C</text></svg><svg id=\"bracket_4\" class=\"codingBracket\" coding_id=\"4\"><path id=\"path_4\" d=\"M130,488L122,488L122,537L130,537\" stroke=\"#000000\" style=\"stroke=#000000\" fill=\"none\" coding_id=\"4\"></path><text id=\"label_4\" x=\"114\" y=\"516.5\" style=\"text-anchor: end; fill:#000000;\" coding_id=\"4\">C</text></svg><svg id=\"bracket_5\" class=\"codingBracket\" coding_id=\"5\"><path id=\"path_5\" d=\"M130,582L122,582L122,682L130,682\" stroke=\"#000000\" style=\"stroke=#000000\" fill=\"none\" coding_id=\"5\"></path><text id=\"label_5\" x=\"114\" y=\"636\" style=\"text-anchor: end; fill:#000000;\" coding_id=\"5\">D</text></svg></svg></div><p><b>What is Lorem Ipsum?</b><br></p><p><b><b><coding id=\"1\" code_id=\"4\" author=\"Matthias Sch�pe\" class=\"tooltipsss\" codename=\"A\" title=\"A\" data-toggle=\"tooltip\" data-placement=\"bottom\">Lorem Ipsum</coding></b><coding id=\"1\" code_id=\"4\" author=\"Matthias Sch�pe\" class=\"tooltipsss\" codename=\"A\" title=\"A\" data-toggle=\"tooltip\" data-placement=\"bottom\"> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</coding></b><br></p><p class=\"paragraph\"><b></b><br></p><p><b><b>Why do we use it?</b></b><br></p><p><b><b><coding id=\"2\" code_id=\"5\" author=\"Matthias Sch�pe\" class=\"tooltipsss\" codename=\"B\" title=\"B\" data-toggle=\"tooltip\" data-placement=\"bottom\">It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</coding></b></b><br></p><p class=\"paragraph\"><b><b></b></b><br></p><p><b><b></b></b><br></p><p><b><b><b>Where does it come from?</b></b></b><br></p><p><b><b><b><coding id=\"3\" code_id=\"6\" author=\"Matthias Sch�pe\" class=\"tooltipsss\" codename=\"C\" title=\"C\" data-toggle=\"tooltip\" data-placement=\"bottom\">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of \"de Finibus Bonorum et Malorum\" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, \"Lorem ipsum dolor sit amet..\", comes from a line in section 1.10.32.</coding></b></b></b><br></p><p class=\"paragraph\"><b><b><b><p><coding id=\"4\" code_id=\"6\" author=\"Matthias Sch�pe\" class=\"tooltipsss\" codename=\"C\" title=\"C\" data-toggle=\"tooltip\" data-placement=\"bottom\">The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from \"de Finibus Bonorum et Malorum\" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</coding><br></p><p><b>Where can I get some?</b><br></p><p><b><coding id=\"5\" code_id=\"7\" author=\"Matthias Sch�pe\" class=\"tooltipsss\" codename=\"D\" title=\"D\" data-toggle=\"tooltip\" data-placement=\"bottom\">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.</coding></b><br></p><b><p><br></p><p><br></p></b></b></b></b><br></p><p><br></p><p><br></p></body></html>";

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
	codeIds.add(4L);
	codeIds.add(5L);
	codeIds.add(6L);
	codeIds.add(7L);

	reliabilityData_SOLUTION = new ArrayList<>();
	ReliabilityData rData1 = new ReliabilityData(6, 2);
	rData1.set(1, 1, 2);
	rData1.set(2, 1, 2);
	rData1.set(3, 1, 1);
	rData1.set(4, 1, 1);
	rData1.set(5, 1, 2);
	rData1.set(6, 1, 1);
	rData1.set(1, 2, 2);
	rData1.set(2, 2, 2);
	rData1.set(3, 2, 1);
	rData1.set(4, 2, 1);
	rData1.set(5, 2, 1);
	rData1.set(6, 2, 1);
	ReliabilityData rData2 = new ReliabilityData(6, 2);
	rData2.set(1, 1, 1);
	rData2.set(2, 1, 1);
	rData2.set(3, 1, 2);
	rData2.set(4, 1, 1);
	rData2.set(5, 1, 1);
	rData2.set(6, 1, 1);
	rData2.set(1, 2, 1);
	rData2.set(2, 2, 1);
	rData2.set(3, 2, 2);
	rData2.set(4, 2, 1);
	rData2.set(5, 2, 1);
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
	rData3.set(3, 2, 1);
	rData3.set(4, 2, 2);
	rData3.set(5, 2, 2);
	rData3.set(6, 2, 1);
	ReliabilityData rData4 = new ReliabilityData(6, 2);
	rData4.set(1, 1, 1);
	rData4.set(2, 1, 1);
	rData4.set(3, 1, 1);
	rData4.set(4, 1, 1);
	rData4.set(5, 1, 1);
	rData4.set(6, 1, 2);
	rData4.set(1, 2, 1);
	rData4.set(2, 2, 1);
	rData4.set(3, 2, 1);
	rData4.set(4, 2, 1);
	rData4.set(5, 2, 1);
	rData4.set(6, 2, 2);

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
